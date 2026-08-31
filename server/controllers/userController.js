import asyncHandler from "../middleware/asyncHandler.js"
import User from "../models/User.js";

// @desc    Get all users (admin only)
export const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password"); // hide password
    res.json({ success: true, data: users });
});

// @desc    Get logged in user profile
export const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    res.json({ success: true, data: user });
});

// @desc    Update logged in user profile
export const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    // update allowed fields only
    user.name = req.body.name || user.name;
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    if (req.body.password) { 
        user.password = req.body.password; // pre-save hook should hash
    }

    const updatedUser = await user.save();

    res.json({
        success: true,
        data: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            
        }
    });
});
