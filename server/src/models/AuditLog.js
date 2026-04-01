const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  action: { type: String, required: true },
  module: { 
    type: String, 
    enum: ["auth", "account", "transaction", "transfer", "loan", "card", "kyc", "admin", "settings", "cheque", "fd", "rd", "other"], 
    required: true 
  },
  description: { type: String },
  
  // Request Details
  ipAddress: { type: String },
  userAgent: { type: String },
  endpoint: { type: String },
  method: { type: String },
  
  // Data Change Tracking
  previousData: { type: mongoose.Schema.Types.Mixed },
  newData: { type: mongoose.Schema.Types.Mixed },
  changes: [{
    field: { type: String },
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  }],
  
  // Status
  status: { type: String, enum: ["success", "failed", "pending"], default: "success" },
  errorMessage: { type: String },
  
  // Amount (for financial transactions)
  amount: { type: Number },
  currency: { type: String, default: "INR" },
  
  // Metadata
  metadata: { type: mongoose.Schema.Types.Mixed },
  sessionId: { type: String },
  
  createdAt: { type: Date, default: Date.now }
});

auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ employee: 1, createdAt: -1 });
auditLogSchema.index({ module: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
