const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  kycId: { type: String, unique: true },
  
  // Personal Details
  fullName: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ["male", "female", "other"] },
  nationality: { type: String, default: "Indian" },
  maritalStatus: { type: String, enum: ["single", "married", "divorced", "widowed"] },
  
  // Address
  address: {
    present: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      country: { type: String }
    },
    permanent: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      country: { type: String }
    }
  },
  
  // Identity Documents
  documents: {
    aadhar: {
      number: { type: String },
      frontImage: { type: String },
      backImage: { type: String },
      verified: { type: Boolean, default: false }
    },
    pan: {
      number: { type: String },
      image: { type: String },
      verified: { type: Boolean, default: false }
    },
    passport: {
      number: { type: String },
      expiryDate: { type: Date },
      image: { type: String },
      verified: { type: Boolean, default: false }
    },
    voterId: {
      number: { type: String },
      image: { type: String },
      verified: { type: Boolean, default: false }
    },
    drivingLicense: {
      number: { type: String },
      expiryDate: { type: Date },
      image: { type: String },
      verified: { type: Boolean, default: false }
    }
  },
  
  // Verification Details
  verificationLevel: { type: Number, default: 0 }, // 0-5 based on documents verified
  isVerified: { type: Boolean, default: false },
  verifiedAt: { type: Date },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  
  // Selfie for verification
  selfieImage: { type: String },
  
  // Risk Assessment
  riskCategory: { type: String, enum: ["low", "medium", "high"], default: "low" },
  riskScore: { type: Number, default: 0 },
  
  // Bank Use
  branchCode: { type: String },
  introducerName: { type: String },
  introducerAccount: { type: String },
  
  // Status
  status: { 
    type: String, 
    enum: ["not_started", "pending", "in_review", "verified", "rejected", "expired"], 
    default: "not_started" 
  },
  rejectionReason: { type: String },
  
  submittedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

kycSchema.pre("save", function(next) {
  if (!this.kycId) {
    this.kycId = "KYC" + Date.now().toString().slice(-8);
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("KYC", kycSchema);
