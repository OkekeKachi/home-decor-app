import jwt  from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id) => {
    return jwt.sign( {id}, process.env.JWT_SECRET, { expiresIn: "1d" });
};

export async function login(req, res) {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Match password using your model's method
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user._id)
        
        

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

export async function registerUser(req, res) {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        

        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        // Create user
        
        const newUser = new User({
            username,
            email,
            password,
        });

        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}
