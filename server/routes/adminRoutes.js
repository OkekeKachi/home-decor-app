// routes/adminRoutes.js
import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { getAdminStats, getTopProducts } from "../controllers/adminController.js";

const router = express.Router();

router.get("/stats", protect, adminOnly, getAdminStats);
router.get("/top-products", protect, adminOnly, getTopProducts);

export default router;
