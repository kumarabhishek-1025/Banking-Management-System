const mongoose = require("mongoose");

const depositSchemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ["fixed", "recurring"], required: true },
  description: { type: String },
  minAmount: { type: Number, required: true },
  maxAmount: { type: Number },
  minTenureMonths: { type: Number, required: true },
  maxTenureMonths: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  interestType: { type: String, enum: ["simple", "compound"], default: "compound" },
  compoundingFrequency: { type: String, enum: ["monthly", "quarterly", "annually"], default: "annually" },
  seniorCitizenRate: { type: Number },
  specialRate: { type: Number },
  specialRateMinAmount: { type: Number },
  specialRateTenureMonths: { type: Number },
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },
  features: [{ type: String }],
  terms: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

depositSchemeSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("DepositScheme", depositSchemeSchema);
