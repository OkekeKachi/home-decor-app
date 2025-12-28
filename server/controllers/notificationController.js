import asyncHandler from "../middleware/asyncHandler.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

// Broadcast to all users
export const broadcastNotification = asyncHandler(async (req, res) => {
    const { type, message } = req.body;

    if (!message) {
        res.status(400);
        throw new Error("Message is required");
    }

    const users = await User.find({}, "_id");

    const notifications = users.map((user) => ({
        userId: user._id,
        type: type || "general",
        message,
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({
        message: "Broadcast notification sent to all users",
        count: users.length,
    });
});

// Get notifications (paginated)
export const getNotifications = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Notification.countDocuments({ userId: req.user._id });

    res.json({
        page,
        totalPages: Math.ceil(total / limit),
        notifications,
    });
});

// Get unread count
export const getUnread = asyncHandler(async (req, res) => {
    const count = await Notification.countDocuments({
        userId: req.user._id,
        isRead: false,
    });
    res.json({ count });
});

// Create a single notification
export const createNotification = asyncHandler(async (req, res) => {
    const { userId, type, message } = req.body;

    if (!userId || !message) {
        res.status(400);
        throw new Error("User ID and message are required");
    }

    const notification = new Notification({ userId, type, message });
    await notification.save();
    res.status(201).json(notification);
});

// Mark as read
export const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { isRead: true },
        { new: true }
    );

    if (!notification) {
        res.status(404);
        throw new Error("Notification not found");
    }

    res.json({ success: true, notification });
});

// Delete a notification
export const deleteNotification = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const notification = await Notification.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!notification) {
        res.status(404);
        throw new Error("Notification not found");
    }

    res.json({ message: "Notification deleted" });
});
