const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  account: { type: mongoose.Schema.Types.ObjectId, ref: "BankAccount", required: true },
  transactionId: { type: String, unique: true },
  type: { 
    type: String, 
    enum: ["deposit", "withdrawal", "transfer", "payment", "bill", "refund"], 
    required: true 
  },
  category: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  description: { type: String },
  recipient: { type: String },
  sender: { type: String },
  senderName: { type: String },
  senderAccountNumber: { type: String },
  status: { type: String, enum: ["pending", "completed", "failed", "cancelled"], default: "pending" },
  paymentMethod: { type: String },
  reference: { type: String },
  note: { type: String },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

transactionSchema.pre("save", function(next) {
  if (!this.transactionId) {
    this.transactionId = "TXN" + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  if (this.status === "completed" && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

module.exports = mongoose.model("Transaction", transactionSchema);
