import express from "express"
const router = express.Router();
import {
    addToCart,
    removeFromCart,
    updateCartItem,
    getUserCart,
    clearCart
} from "../controllers/cartController.js"
import { protect } from "../middleware/authMiddleware.js"

// Routes
router.post("/add", protect, addToCart,);
router.delete("/remove/:productId", protect, removeFromCart);
// Clear entire cart
router.delete("/clear", protect, clearCart);
router.put("/update", protect, updateCartItem);
router.get("/", protect, getUserCart);


export default router;