const mongoose = require("mongoose");

const transferSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  senderAccount: { type: mongoose.Schema.Types.ObjectId, ref: "BankAccount" },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiverAccount: { type: mongoose.Schema.Types.ObjectId, ref: "BankAccount" },
  amount: { type: Number, required: true },
  type: { type: String, enum: ["internal", "IMPS", "RTGS", "NEFT", "SWIFT"], default: "internal" },
  currency: { type: String, default: "INR" },
  status: { type: String, enum: ["pending", "completed", "failed", "cancelled"], default: "pending" },
  description: { type: String },
  reference: { type: String },
  charges: { type: Number, default: 0 },
  beneficiary: {
    name: String,
    accountNumber: String,
    ifsc: String,
    bankName: String
  },
  isExternal: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

module.exports = mongoose.model("Transfer", transferSchema);
