const mongoose = require("mongoose");

const branchSchema = new mongoose.Schema({
  branchCode: { type: String, unique: true },
  branchName: { type: String, required: true },
  branchType: { 
    type: String, 
    enum: ["head_office", "regional", "urban", "semi_urban", "rural"], 
    default: "urban" 
  },
  
  // Address
  address: {
    street: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: "India" }
  },
  
  // Contact
  contact: {
    phone: { type: String },
    email: { type: String },
    tollFree: { type: String },
    fax: { type: String }
  },
  
  // Location
  location: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  
  // Operating Hours
  workingHours: {
    monday: { open: { type: String, default: "09:00" }, close: { type: String, default: "17:00" }, closed: { type: Boolean, default: false } },
    tuesday: { open: { type: String, default: "09:00" }, close: { type: String, default: "17:00" }, closed: { type: Boolean, default: false } },
    wednesday: { open: { type: String, default: "09:00" }, close: { type: String, default: "17:00" }, closed: { type: Boolean, default: false } },
    thursday: { open: { type: String, default: "09:00" }, close: { type: String, default: "17:00" }, closed: { type: Boolean, default: false } },
    friday: { open: { type: String, default: "09:00" }, close: { type: String, default: "17:00" }, closed: { type: Boolean, default: false } },
    saturday: { open: { type: String, default: "10:00" }, close: { type: String, default: "14:00" }, closed: { type: Boolean, default: false } },
    sunday: { open: { type: String, default: "00:00" }, close: { type: String, default: "00:00" }, closed: { type: Boolean, default: true } }
  },
  
  // Services Offered
  services: [{
    name: { type: String },
    available: { type: Boolean, default: true }
  }],
  
  // Management
  branchManager: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  assistantManager: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  
  // Statistics
  staffCount: { type: Number, default: 0 },
  totalAccounts: { type: Number, default: 0 },
  totalDeposits: { type: Number, default: 0 },
  totalLoans: { type: Number, default: 0 },
  
  // Status
  isActive: { type: Boolean, default: true },
  ifscCode: { type: String },
  micrCode: { type: String },
  swiftCode: { type: String },
  
  // Setup Date
  inaugurationDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

branchSchema.pre("save", function(next) {
  if (!this.branchCode) {
    const cityCode = this.address.city.substring(0, 3).toUpperCase();
    this.branchCode = "BR" + cityCode + Date.now().toString().slice(-4);
  }
  if (!this.ifscCode) {
    this.ifscCode = "HZB" + this.branchCode;
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Branch", branchSchema);
