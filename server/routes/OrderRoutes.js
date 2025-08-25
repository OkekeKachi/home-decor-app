// routes/orderRoutes.js
import express from "express";
import {
    checkout,
    confirmPayment,
    getMyOrders,
    getAllOrders,
    updateOrderStatus
} from "../controllers/orderController.js";
import {protect, adminOnly} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/checkout", protect, checkout);
router.post("/confirmPayment", protect, confirmPayment);
router.get("/my-orders", protect, getMyOrders);

// Admin routes
router.get("/", protect, adminOnly, getAllOrders);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

export default router;
