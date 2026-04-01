const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const bankAccountSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  accountId: { type: String, unique: true, default: () => uuidv4() },
  accountNumber: { type: String, required: true },
  routingNumber: { type: String, required: true },
  accountType: { type: String, enum: ["checking", "savings"], default: "checking" },
  bankName: { type: String, required: true },
  branchName: { type: String },
  ifscCode: { type: String },
  balance: { type: Number, default: 0 },
  availableBalance: { type: Number, default: 0 },
  currency: { type: String, default: "USD" },
  status: { type: String, enum: ["pending", "active", "rejected", "inactive", "frozen", "closed_by_customer", "closed_by_admin"], default: "pending" },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  closureReason: { type: String },
  closedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("BankAccount", bankAccountSchema);
