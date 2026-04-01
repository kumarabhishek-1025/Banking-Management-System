const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const Notification = require("../models/Notification");

const router = express.Router();

// Get My Notifications (Customer)
router.get("/", auth, async (req, res) => {
  try {
    const { type, isRead, limit = 50, page = 1 } = req.query;
    const query = { user: req.userId };

    if (type) query.type = type;
    if (isRead !== undefined) query.isRead = isRead === "true";

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const unreadCount = await Notification.countDocuments({ user: req.userId, isRead: false });

    res.json({
      notifications,
      unreadCount,
      total: await Notification.countDocuments(query)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark Notification as Read
router.post("/:id/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, user: req.userId });
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({ message: "Marked as read", notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark All as Read
router.post("/read-all", auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Notification
router.delete("/:id", auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear All Notifications
router.delete("/clear/all", auth, async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.userId });
    res.json({ message: "All notifications cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Send Notification to User
router.post("/send", auth, admin, async (req, res) => {
  try {
    const { userId, type, title, message, priority } = req.body;

    const notification = await Notification.create({
      user: userId,
      type: type || "system",
      title,
      message,
      priority: priority || "medium",
      channel: "in_app"
    });

    res.status(201).json({ message: "Notification sent", notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Broadcast to All Users
router.post("/broadcast", auth, admin, async (req, res) => {
  try {
    const { type, title, message, priority } = req.body;
    const User = require("../models/User");
    const users = await User.find({ role: "user" });

    const notifications = await Notification.insertMany(
      users.map(user => ({
        user: user._id,
        type: type || "system",
        title,
        message,
        priority: priority || "medium",
        channel: "in_app",
        sentAt: new Date()
      }))
    );

    res.status(201).json({ message: "Broadcast sent", count: notifications.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
