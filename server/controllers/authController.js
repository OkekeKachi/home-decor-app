import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { getDelay } from "../utils/Security.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { BrevoClient } from "@getbrevo/brevo";

const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
});


// const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         type: "OAuth2",
//         user: process.env.GMAIL_USER,
//         clientId: process.env.GOOGLE_CLIENT_ID,
//         clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//         refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
//     },
// });

// transporter.verify((error, success) => {
//     if (error) {
//         console.error("Gmail OAuth2 connection failed:", error);
//     } else {
//         console.log("Gmail OAuth2 connection successful!");
//     }
// });




const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};
// 5️⃣ Send verification email



// @desc    Login user
// @route   POST /api/auth/login
// @access  Public

const sendVerificationEmail = async (user, token) => {
    const verificationUrl =
        `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    const result = await brevo.transactionalEmails.sendTransacEmail({
        sender: {
            name: "Luxe Home",
            email: process.env.GMAIL_USER,
        },
        to: [
            {
                email: user.email,
                name: user.firstName || user.username,
            },
        ],
        subject: "Verify your email for Luxe Home",
        htmlContent: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <p>Hi ${user.firstName || user.username},</p>

                <p>Thanks for registering with Luxe Home!</p>

                <p>Please click the button below to verify your email:</p>

                <a
                    href="${verificationUrl}"
                    style="
                        display: inline-block;
                        background: #f59e0b;
                        color: #fff;
                        padding: 12px 24px;
                        border-radius: 6px;
                        text-decoration: none;
                        font-weight: bold;
                    "
                >
                    Verify Email
                </a>

                <p>This verification link expires in 1 hour.</p>

                <p>
                    If you didn't create this account, you can ignore this email.
                </p>
            </div>
        `,
    });

    console.log("Verification email sent:", result.messageId);

    return result;
};


export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {     
        res.status(400);
        throw new Error("Invalid credentials, please enter the correct email and password");
    }
    const now = new Date();
    const delay = getDelay(user.failedLoginAttempts);

    if (!user.isVerified) {
        res.status(401);
        throw new Error("Please verify your email before logging in");
    }

    if (user.lastFailedLogin && now - user.lastFailedLogin < delay) {
        return res.status(429).json({
            message: `Too many failed attempts.`,
            retryAfterSeconds: Math.ceil((delay - (now - user.lastFailedLogin)) / 1000) 
        });
    }

    // Match password using your model's method
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        user.failedLoginAttempts += 1;
        user.lastFailedLogin = new Date();
        await user.save();
        res.status(400);
        throw new Error("Invalid credentials, please enter the correct email and password");
    }

    user.failedLoginAttempts = 0;
    user.lastFailedLogin = null;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
        message: "Login successful",
        token,
        user:{
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName
        },
    });
});

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
        res.status(400);
        throw new Error("User already exists");
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
        res.status(400);
        throw new Error("Invalid email format");
    }
    if (existingUser && !existingUser.isVerified) {
        const token = crypto.randomBytes(32).toString("hex");

        existingUser.verificationToken = token;
        existingUser.verificationTokenExpiry = Date.now() + 60 * 60 * 1000;
        existingUser.lastVerificationSent = Date.now();

        await existingUser.save();

        await sendVerificationEmail(existingUser, token);

        return res.status(200).json({
            message: "Account exists but is not verified. New verification email sent.",
        });
    }

    const token = crypto.randomBytes(32).toString("hex");

    // Create user
    const newUser = new User({
        username,
        email,
        password,
        firstName,
        lastName,
        isVerified: false,
        verificationToken: token,
        verificationTokenExpiry: Date.now() + 60 * 60 * 1000,
    });
    try {
        await newUser.save();
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "User already exists" });
        }
        throw err;
    }
    await sendVerificationEmail(newUser, token);

    res.status(201).json({
        message: "User registered successfully"
    });

    
});


export const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;

    const user = await User.findOne({
        verificationToken: token,
        verificationTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
        return res.status(400).json({
            message: "Invalid or expired verification link",
        });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;

    await user.save();

    return res.status(200).json({
        message: "Email verified successfully",
    });
});

export const resendVerification = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({
            message: "User not found",
        });
    }

    if (user.isVerified) {
        return res.status(400).json({
            message: "Account already verified",
        });
    }

    // Prevent spam
    if (
        user.lastVerificationSent &&
        Date.now() - user.lastVerificationSent < 2 * 60 * 1000
    ) {
        return res.status(429).json({
            message: "Please wait before requesting another email",
        });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.verificationToken = token;
    user.verificationTokenExpiry = Date.now() + 60 * 60 * 1000;
    user.lastVerificationSent = Date.now();

    await user.save();

    await sendVerificationEmail(user, token);

    res.status(200).json({
        message: "Verification email resent successfully",
    });
});

export const checkVerification = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email }).select("isVerified");

    return res.json({ verified: !!user?.isVerified });
};

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Anti-enumeration
    if (!user) {
        return res.json({
            message: "If an account exists, a reset link has been sent.",
        });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl =
        `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const result = await brevo.transactionalEmails.sendTransacEmail({
        sender: {
            name: "Luxe Home",
            email: process.env.GMAIL_USER,
        },
        to: [
            {
                email: user.email,
                name: user.firstName || user.username,
            },
        ],
        subject: "Reset your Luxe Home password",
        htmlContent: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Password Reset</h2>

                <p>
                    You requested a password reset for your Luxe Home account.
                </p>

                <p>
                    Click the button below to create a new password:
                </p>

                <a
                    href="${resetUrl}"
                    style="
                        display: inline-block;
                        background: #f59e0b;
                        color: #fff;
                        padding: 12px 24px;
                        border-radius: 6px;
                        text-decoration: none;
                        font-weight: bold;
                    "
                >
                    Reset Password
                </a>

                <p>This link expires in 15 minutes.</p>

                <p>
                    If you didn't request a password reset, you can safely
                    ignore this email.
                </p>
            </div>
        `,
    });

    console.log("Password reset email sent:", result.messageId);

    return res.json({
        message: "If an account exists, a reset link has been sent.",
    });
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    console.log(token);
    console.log(password);
    
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
      
console.log(hashedToken);


  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired token");
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;

  await user.save();

  res.json({ message: "Password reset successful" });
});
