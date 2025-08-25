// routes/wishlist.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    addToWishlist,
    removeFromWishlist,
    getWishlist,
} from "../controllers/wishlistController.js";

const router = express.Router();
 
router.post("/add/:productId", protect, addToWishlist);
router.delete("/remove/:productId", protect, removeFromWishlist);
router.get("/", protect, getWishlist);

export default router;
