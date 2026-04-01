const mongoose = require("mongoose");

const creditCardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  account: { type: mongoose.Schema.Types.ObjectId, ref: "BankAccount" },
  cardNumber: { type: String, unique: true },
  cardType: { type: String, enum: ["gold", "platinum", "titanium", "signature"], default: "gold" },
  cardHolderName: { type: String, required: true },
  expiryMonth: { type: Number, required: true },
  expiryYear: { type: Number, required: true },
  cvv: { type: String, required: true },
  creditLimit: { type: Number, default: 50000 },
  availableCredit: { type: Number, default: 50000 },
  currentBalance: { type: Number, default: 0 },
  outstandingAmount: { type: Number, default: 0 },
  lastPaymentAmount: { type: Number, default: 0 },
  lastPaymentDate: { type: Date },
  billingCycleStart: { type: Number, default: 1 },
  billingCycleEnd: { type: Number, default: 30 },
  interestRate: { type: Number, default: 3.5 },
  annualFee: { type: Number, default: 500 },
  rewardPoints: { type: Number, default: 0 },
  status: { type: String, enum: ["pending", "active", "rejected", "blocked", "cancelled", "expired", "customer_deleted"], default: "pending" },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  cancellationReason: { type: String },
  cardImage: { type: String },
  issueDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

creditCardSchema.pre("save", function(next) {
  if (!this.cardNumber) {
    const generateCardNumber = () => {
      let card = "4";
      for (let i = 0; i < 15; i++) {
        card += Math.floor(Math.random() * 10);
      }
      return card;
    };
    this.cardNumber = generateCardNumber();
  }
  next();
});

module.exports = mongoose.model("CreditCard", creditCardSchema);
