// controllers/wishlistController.js
import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";

// ✅ Add product to wishlist
export const addToWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.wishlist.includes(req.params.productId)) {
        user.wishlist.push(req.params.productId);
        await user.save();
    }

    res.json({
        success: true,
        message: "Product added to wishlist",
        wishlist: user.wishlist
    });
});

// ✅ Remove product from wishlist
export const removeFromWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    user.wishlist = user.wishlist.filter(
        (id) => id.toString() !== req.params.productId
    );
    await user.save();

    res.json({
        success: true,
        message: "Product removed from wishlist",
        wishlist: user.wishlist
    });
});

// ✅ Get wishlist
export const getWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).populate("wishlist");
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, wishlist: user.wishlist });
});
