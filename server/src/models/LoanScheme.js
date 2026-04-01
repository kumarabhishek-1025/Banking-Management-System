const mongoose = require("mongoose");

const loanSchemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["home", "car", "personal", "education", "business"], required: true },
  description: { type: String },
  minAmount: { type: Number, required: true },
  maxAmount: { type: Number },
  interestRate: { type: Number, required: true },
  tenureMin: { type: Number, required: true }, // in months
  tenureMax: { type: Number, required: true }, // in months
  eligibility: { type: String },
  documents: [{ type: String }],
  processingFee: { type: Number, default: 0 },
  features: [{ type: String }],
  terms: [{ type: String }],
  status: { type: String, enum: ["active", "inactive"], default: "active" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

loanSchemeSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("LoanScheme", loanSchemeSchema);