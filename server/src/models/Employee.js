const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["admin", "manager", "teller", "clerk", "support", "auditor"], 
    default: "clerk" 
  },
  department: { 
    type: String, 
    enum: ["operations", "customer_service", "loans", "accounts", "it", "hr", "finance", "audit"], 
    default: "operations" 
  },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  designation: { type: String },
  salary: { type: Number },
  dateOfBirth: { type: Date },
  joinDate: { type: Date, default: Date.now },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  aadharCard: { type: String },
  panCard: { type: String },
  emergencyContact: { type: String },
  emergencyPhone: { type: String },
  permissions: [{
    module: { type: String },
    canRead: { type: Boolean, default: false },
    canWrite: { type: Boolean, default: false },
    canDelete: { type: Boolean, default: false },
    canApprove: { type: Boolean, default: false }
  }],
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

employeeSchema.pre("save", async function(next) {
  if (!this.employeeId) {
    this.employeeId = "EMP" + Date.now().toString().slice(-6);
  }
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

employeeSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
