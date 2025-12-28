import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";
import {getDelay} from "../utils/Security.js";

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        console.log("User not found with email:", email, password);
        
        res.status(400);
        throw new Error("Invalid credentials, please enter the correct email and password");
    }
    const now = new Date();
    const delay = getDelay(user.failedLoginAttempts);

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
        },
    });
});

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        res.status(400);
        throw new Error("User already exists");
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
        res.status(400);
        throw new Error("Invalid email format");
    }

    // Create user
    const newUser = new User({
        username,
        email,
        password,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
});
