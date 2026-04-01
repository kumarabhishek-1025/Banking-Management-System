const mongoose = require("mongoose");

const recurringDepositSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  account: { type: mongoose.Schema.Types.ObjectId, ref: "BankAccount", required: true },
  schemeName: { type: String },
  rdNumber: { type: String, unique: true },
  monthlyAmount: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  tenureMonths: { type: Number, required: true },
  totalDeposited: { type: Number, default: 0 },
  maturityAmount: { type: Number, required: true },
  currentDeposit: { type: Number, default: 0 },
  depositCount: { type: Number, default: 0 },
  startDate: { type: Date, default: Date.now },
  nextDepositDate: { type: Date },
  maturityDate: { type: Date, required: true },
  autoDebit: { type: Boolean, default: true },
  status: { type: String, enum: ["pending", "active", "rejected", "paused", "completed", "cancelled", "defaulted", "customer_deleted", "withdrawn_early"], default: "pending" },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  closureReason: { type: String },
  nomineeName: { type: String },
  nomineeRelation: { type: String },
  createdAt: { type: Date, default: Date.now }
});

recurringDepositSchema.pre("save", function(next) {
  if (!this.rdNumber) {
    this.rdNumber = "RD" + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
  }
  if (!this.nextDepositDate) {
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);
    this.nextDepositDate = nextDate;
  }
  next();
});

module.exports = mongoose.model("RecurringDeposit", recurringDepositSchema);
