const mongoose = require("mongoose");

const fixedDepositSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  account: { type: mongoose.Schema.Types.ObjectId, ref: "BankAccount", required: true },
  schemeName: { type: String },
  fdNumber: { type: String, unique: true },
  amount: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  tenure: { type: Number, required: true }, // in months
  maturityAmount: { type: Number, required: true },
  maturityDate: { type: Date, required: true },
  status: { type: String, enum: ["pending", "active", "rejected", "matured", "withdrawn", "customer_deleted"], default: "pending" },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  closureReason: { type: String },
  createdAt: { type: Date, default: Date.now }
});

fixedDepositSchema.pre("save", function(next) {
  if (!this.fdNumber) {
    this.fdNumber = "FD" + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
  }
  next();
});

module.exports = mongoose.model("FixedDeposit", fixedDepositSchema);
