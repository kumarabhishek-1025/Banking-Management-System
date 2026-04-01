const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { 
    type: String, 
    enum: ["transaction", "alert", "security", "promotion", "reminder", "system"], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  channel: { type: String, enum: ["in_app", "email", "sms", "push"], default: "in_app" },
  priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  actionUrl: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  scheduledFor: { type: Date },
  sentAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
