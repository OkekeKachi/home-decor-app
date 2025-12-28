import express from "express";
import {
    getNotifications,
    markAsRead,
    createNotification,
    deleteNotification,
    getUnread,
} from "../controllers/notificationController.js";
import { broadcastNotification } from "../controllers/notificationController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all notifications for a user
router.get("/", protect, getNotifications);
router.get("/unread", protect, getUnread);





// Create a new notification
router.post("/", createNotification);

// Mark notification as read
router.patch("/:id/read", protect,markAsRead);

// Delete a notification
router.delete("/:id", deleteNotification);

router.post("/broadcast",  protect, adminOnly,broadcastNotification);


export default router;
