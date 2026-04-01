const mongoose = require("mongoose");

const chequeBookSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  account: { type: mongoose.Schema.Types.ObjectId, ref: "BankAccount", required: true },
  chequeBookNumber: { type: String, unique: true },
  startChequeNumber: { type: String, required: true },
  endChequeNumber: { type: String, required: true },
  leafCount: { type: Number, default: 25 },
  issueDate: { type: Date, default: Date.now },
  deliveryDate: { type: Date },
  deliveryMode: { type: String, enum: ["courier", "branch_pickup"], default: "courier" },
  deliveryAddress: { type: String },
  status: { type: String, enum: ["pending", "approved", "rejected", "issued", "delivered", "cancelled", "customer_deleted"], default: "pending" },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  dispatchedAt: { type: Date },
  receivedAt: { type: Date },
  cancelledAt: { type: Date },
  cancellationReason: { type: String },
  createdAt: { type: Date, default: Date.now }
});

chequeBookSchema.pre("save", function(next) {
  if (!this.chequeBookNumber) {
    this.chequeBookNumber = "CB" + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

module.exports = mongoose.model("ChequeBook", chequeBookSchema);
