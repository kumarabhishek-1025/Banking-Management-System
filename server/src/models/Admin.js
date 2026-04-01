const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({
  adminId: { type: String, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["super_admin", "admin"], 
    default: "admin" 
  },
  department: { 
    type: String, 
    default: "administration" 
  },
  designation: { type: String, default: "Administrator" },
  isActive: { type: Boolean, default: true },
  permissions: {
    users: { type: Boolean, default: true },
    accounts: { type: Boolean, default: true },
    transactions: { type: Boolean, default: true },
    loans: { type: Boolean, default: true },
    deposits: { type: Boolean, default: true },
    reports: { type: Boolean, default: true },
    settings: { type: Boolean, default: true }
  },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

adminSchema.pre("save", async function(next) {
  if (!this.adminId) {
    this.adminId = "ADMIN" + Date.now().toString().slice(-6);
  }
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

adminSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
