// controllers/wishlistController.js
import User from "../models/User.js";

// Add product to wishlist
export const addToWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user.wishlist.includes(req.params.productId)) {
            user.wishlist.push(req.params.productId);
            await user.save();
        }
        res.json({ message: "Product added to wishlist", wishlist: user.wishlist });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

// Remove product from wishlist
export const removeFromWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.wishlist = user.wishlist.filter(
            (id) => id.toString() !== req.params.productId
        );
        await user.save();
        res.json({ message: "Product removed from wishlist", wishlist: user.wishlist });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};

// Get wishlist
export const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate("wishlist");
        res.json(user.wishlist);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};
