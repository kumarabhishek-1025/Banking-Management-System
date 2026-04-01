const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  account: { type: mongoose.Schema.Types.ObjectId, ref: "BankAccount", required: true },
  amount: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  tenure: { type: Number, required: true }, // in months
  purpose: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected", "repaid"], default: "pending" },
  monthlyEmi: { type: Number, required: true },
  totalRepayable: { type: Number, required: true },
  repaidAmount: { type: Number, default: 0 },
  nextPaymentDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Loan", loanSchema);
