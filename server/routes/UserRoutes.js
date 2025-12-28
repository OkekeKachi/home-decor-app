import express from "express";
import { getAllUsers, getProfile, updateProfile } from "../controllers/userController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only admin can see all users
router.get("/all", protect, adminOnly, getAllUsers);

// Logged-in user routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

export default router;
