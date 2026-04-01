const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const customerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  postalCode: { type: String },
  dateOfBirth: { type: String },
  ssn: { type: String },
  avatar: { type: String, default: "" },
  role: { type: String, enum: ["user", "customer"], default: "customer" },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  resetOTP: { type: String },
  resetOTPExpiry: { type: Date },
  isEmailVerified: { type: Boolean, default: false },
  verificationOTP: { type: String },
  verificationOTPExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

customerSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

customerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Customer = mongoose.model("Customer", customerSchema);

module.exports = Customer;
