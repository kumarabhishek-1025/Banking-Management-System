const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  ticketNumber: {
    type: String,
    default: () => "TKT" + Date.now() + Math.floor(Math.random() * 1000)
  },
  subject: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ["transaction", "account", "loan", "card", "service", "other"],
    default: "other"
  },
  status: {
    type: String,
    enum: ["pending", "open", "in_progress", "resolved", "closed", "rejected"],
    default: "pending"
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium"
  },
  relatedAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BankAccount"
  },
  relatedTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction"
  },
  responses: [{
    from: {
      type: String,
      enum: ["customer", "staff", "system"]
    },
    message: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    respondedAt: {
      type: Date,
      default: Date.now
    }
  }],
  response: {
    message: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    respondedAt: Date
  },
  rejectionReason: String,
  resolvedAt: Date
}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);
