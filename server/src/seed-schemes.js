const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGO_URI || "mongodb+srv://kabhishek76673_db_user:coderarmy@cluster0.dsh1bkp.mongodb.net/horizon?appName=Cluster0";

const depositSchemeSchema = new mongoose.Schema({
  name: String,
  type: String,
  description: String,
  minAmount: Number,
  maxAmount: Number,
  minTenureMonths: Number,
  maxTenureMonths: Number,
  interestRate: Number,
  interestType: String,
  compoundingFrequency: String,
  seniorCitizenRate: Number,
  specialRate: Number,
  specialRateMinAmount: Number,
  isActive: Boolean,
  isDefault: Boolean,
  features: [String],
  terms: [String],
  createdAt: Date,
  updatedAt: Date
});

const DepositScheme = mongoose.model("DepositScheme", depositSchemeSchema);

async function seedSchemes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    await DepositScheme.deleteMany({});
    console.log("Cleared existing schemes");

    const schemes = [
      {
        name: "Standard Fixed Deposit",
        type: "fixed",
        description: "Traditional fixed deposit with competitive interest rates. Ideal for conservative investors seeking guaranteed returns.",
        minAmount: 1000,
        maxAmount: 10000000,
        minTenureMonths: 12,
        maxTenureMonths: 60,
        interestRate: 7.5,
        interestType: "compound",
        compoundingFrequency: "annually",
        seniorCitizenRate: 8.0,
        specialRate: 8.0,
        specialRateMinAmount: 500000,
        isActive: true,
        isDefault: true,
        features: [
          "Higher interest rates for senior citizens",
          "Loan against FD available up to 75%",
          "Auto-renewal option available",
          "Nomination facility included",
          "Quarterly interest payout option"
        ],
        terms: [
          "Interest calculated on yearly compounding basis",
          "Premature withdrawal allowed with reduced rate",
          "Minimum tenure is 12 months",
          "Tax benefits under Section 80C available",
          " TDS applicable on interest above ₹10,000/year"
        ]
      },
      {
        name: "Short Term FD",
        type: "fixed",
        description: "For short term investment goals with flexible tenure options. Perfect for parking funds temporarily.",
        minAmount: 500,
        maxAmount: 100000,
        minTenureMonths: 6,
        maxTenureMonths: 11,
        interestRate: 6.5,
        interestType: "simple",
        compoundingFrequency: "annually",
        isActive: true,
        features: [
          "Flexible tenure from 6 to 11 months",
          "Ideal for short-term financial goals",
          "Simple interest calculation",
          "Quick processing and activation"
        ],
        terms: [
          "Simple interest paid on maturity",
          "No premature withdrawal penalty for 6+ months",
          "Minimum deposit of ₹500",
          "Single account holder only"
        ]
      },
      {
        name: "Long Term FD",
        type: "fixed",
        description: "Higher returns for long term investors. Best for retirement planning and wealth accumulation.",
        minAmount: 1000,
        maxAmount: null,
        minTenureMonths: 36,
        maxTenureMonths: 120,
        interestRate: 8.0,
        interestType: "compound",
        compoundingFrequency: "annually",
        seniorCitizenRate: 8.5,
        isActive: true,
        features: [
          "Maximum interest rate for long-term deposits",
          "Best for retirement and wealth creation",
          "Tax saver option with 5-year lock-in",
          "Higher rates for senior citizens",
          "Compounded annually for maximum returns"
        ],
        terms: [
          "Minimum tenure of 36 months required",
          "Tax saver FD has 5-year lock-in period",
          "No partial withdrawal allowed",
          "Senior citizen verification required for higher rate"
        ]
      },
      {
        name: "Standard Recurring Deposit",
        type: "recurring",
        description: "Build your savings with monthly deposits. Perfect for regular savers who want to develop a saving habit.",
        minAmount: 500,
        maxAmount: 100000,
        minTenureMonths: 12,
        maxTenureMonths: 60,
        interestRate: 6.5,
        interestType: "compound",
        compoundingFrequency: "monthly",
        seniorCitizenRate: 7.0,
        specialRate: 7.0,
        specialRateMinAmount: 50000,
        isActive: true,
        isDefault: true,
        features: [
          "Build savings with monthly deposits",
          "Automatic debit from savings account",
          "Higher interest for senior citizens",
          "Loan against RD available",
          "Flexible tenure options"
        ],
        terms: [
          "Monthly installment must be paid on time",
          "Interest calculated monthly and compounded",
          "Premature closure allowed after 12 months",
          "Maximum 3 installments can be skipped",
          "Skipped installments subject to penalty"
        ]
      },
      {
        name: "RD for Senior Citizens",
        type: "recurring",
        description: "Special recurring deposit scheme for senior citizens with enhanced interest rates and benefits.",
        minAmount: 500,
        maxAmount: 500000,
        minTenureMonths: 12,
        maxTenureMonths: 60,
        interestRate: 7.5,
        interestType: "compound",
        compoundingFrequency: "monthly",
        isActive: true,
        features: [
          "Higher interest rate for senior citizens",
          "Special benefits and preferential treatment",
          "Loan against RD up to 80%",
          "Flexible payment options",
          "Maturity proceeds can be transferred to savings"
        ],
        terms: [
          "Age proof required (60 years and above)",
          "Valid ID proof mandatory",
          "Maximum deposit limit ₹5 Lakhs",
          "Interest paid on quarterly basis",
          "Early closure after 12 months with notice"
        ]
      },
      {
        name: "Flexible RD",
        type: "recurring",
        description: "Flexible tenure recurring deposit for custom investment plans. Adjust your monthly contribution as needed.",
        minAmount: 200,
        maxAmount: null,
        minTenureMonths: 6,
        maxTenureMonths: 120,
        interestRate: 5.5,
        interestType: "compound",
        compoundingFrequency: "monthly",
        isActive: true,
        features: [
          "Start with as low as ₹200/month",
          "No maximum limit on deposits",
          "Tenure from 6 months to 10 years",
          "Increase/decrease installment amount",
          "Easy premature closure option"
        ],
        terms: [
          "Minimum 6 months tenure",
          "Minimum 6 installments required",
          "Can skip maximum 2 consecutive installments",
          "Interest reduced by 1% for early closure",
          "Processing fee of ₹100 for closure"
        ]
      }
    ];

    await DepositScheme.insertMany(schemes);
    console.log("Created 6 default deposit schemes with features and terms!");

    console.log("\n✅ Seed completed!");
    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

seedSchemes();