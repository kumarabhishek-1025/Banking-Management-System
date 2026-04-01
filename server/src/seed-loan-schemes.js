const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGO_URI || "mongodb+srv://kabhishek76673_db_user:coderarmy@cluster0.dsh1bkp.mongodb.net/horizon?appName=Cluster0";

const loanSchemeSchema = new mongoose.Schema({
  name: String,
  type: String,
  description: String,
  minAmount: Number,
  maxAmount: Number,
  interestRate: Number,
  tenureMin: Number,
  tenureMax: Number,
  eligibility: String,
  documents: [String],
  processingFee: Number,
  features: [String],
  terms: [String],
  status: String,
  createdAt: Date,
  updatedAt: Date
});

const LoanScheme = mongoose.model("LoanScheme", loanSchemeSchema);

async function seedLoanSchemes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    await LoanScheme.deleteMany({});
    console.log("Cleared existing loan schemes");

    const schemes = [
      {
        name: "Personal Loan",
        type: "personal",
        description: "Unsecured loan for personal expenses like wedding, travel, or medical emergencies. Quick approval with minimal documentation.",
        minAmount: 50000,
        maxAmount: 2000000,
        interestRate: 12,
        tenureMin: 12,
        tenureMax: 60,
        eligibility: "Age 21-60 years, minimum income ₹25,000/month, CIBIL score 650+",
        documents: ["ID Proof", "Address Proof", "Income Proof", "Bank Statements"],
        processingFee: 2.5,
        features: [
          "No collateral required",
          "Quick approval within 24 hours",
          "Flexible repayment options",
          "Part prepayment allowed after 6 months",
          "Top-up loan facility available"
        ],
        terms: [
          "Processing fee: 2.5% of loan amount",
          "Interest rate varies based on CIBIL score",
          "Minimum 6 EMIs must be paid before prepayment",
          "Foreclosure charges: 4% of outstanding amount",
          "Legal and technical verification charges apply"
        ],
        status: "active"
      },
      {
        name: "Home Loan",
        type: "home",
        description: "Buy your dream home with our competitive home loan. Low interest rates with tax benefits under Section 24 and 80C.",
        minAmount: 100000,
        maxAmount: 50000000,
        interestRate: 8.5,
        tenureMin: 60,
        tenureMax: 360,
        eligibility: "Age 18-65 years, minimum income ₹30,000/month, property in India",
        documents: ["ID Proof", "Address Proof", "Income Proof", "Property Documents", "CIBIL Report"],
        processingFee: 0.5,
        features: [
          "Low interest rates starting from 8.5%",
          "Tax benefits on principal and interest",
          "Loan upto 90% of property value",
          "Balance transfer facility available",
          "Top-up loan for renovation"
        ],
        terms: [
          "Processing fee: 0.5% of loan amount (min ₹3,000)",
          "Interest rate based on credit profile",
          "Property must be approved by bank empaneled valuer",
          "Insurance coverage mandatory",
          "Legal verification charges apply"
        ]
      },
      {
        name: "Car Loan",
        type: "car",
        description: "Finance your new or pre-owned car with attractive interest rates. Quick processing and flexible repayment options.",
        minAmount: 100000,
        maxAmount: 5000000,
        interestRate: 9.5,
        tenureMin: 12,
        tenureMax: 84,
        eligibility: "Age 21-65 years, minimum income ₹25,000/month, valid driving license",
        documents: ["ID Proof", "Address Proof", "Income Proof", "Car Quotation", "Driving License"],
        processingFee: 1,
        features: [
          "Finance upto 100% of ex-showroom price",
          "Zero down payment option available",
          "Quick approval within 4 hours",
          "Insurance coverage bundled",
          "Trade-in facility for old car"
        ],
        terms: [
          "Processing fee: 1% of loan amount",
          "Interest rate varies based on car model and tenure",
          "Comprehensive insurance mandatory throughout loan tenure",
          "Hypothecation of vehicle to bank until loan closure",
          "Early settlement charges: 3% of outstanding amount"
        ]
      },
      {
        name: "Education Loan",
        type: "education",
        description: "Fund your higher education in India or abroad. Competitive interest rates with moratium period for students.",
        minAmount: 50000,
        maxAmount: 20000000,
        interestRate: 8,
        tenureMin: 12,
        tenureMax: 180,
        eligibility: "Age 18-35 years, admission letter from recognized institution, minimum 60% in previous qualification",
        documents: ["ID Proof", "Admission Letter", "Fee Structure", "Income Proof", "Academic Records"],
        processingFee: 0.5,
        features: [
          "Low interest rates for top institutions",
          "Moratorium period during course duration",
          "Tax benefits under Section 80E",
          "Loan for studying abroad available",
          "No collateral for loans upto ₹20 Lakhs"
        ],
        terms: [
          "Processing fee: 0.5% of loan amount",
          "Interest rate 8% for premier institutions, 10% for others",
          "Collateral required for loans above ₹20 Lakhs",
          "Course completion certificate needed for disbursement",
          "Emi starts after moratium period or course completion"
        ]
      },
      {
        name: "Business Loan",
        type: "business",
        description: "Grow your business with working capital or term loans. Flexible funding options for expansion, inventory, or equipment.",
        minAmount: 100000,
        maxAmount: 10000000,
        interestRate: 14,
        tenureMin: 12,
        tenureMax: 60,
        eligibility: "Business vintage 2+ years, minimum annual turnover ₹10 Lakhs, profit making",
        documents: ["Business Registration", "Financial Statements", "IT Returns", "Bank Statements", "Property Documents"],
        processingFee: 2,
        features: [
          "Unsecured loans upto ₹50 Lakhs",
          "Working capital and term loan both available",
          "Quick disbursement within 72 hours",
          "Flexible EMI options",
          "Top-up facility for existing customers"
        ],
        terms: [
          "Processing fee: 2% of loan amount",
          "Interest rate based on business profile and credit score",
          "GST returns for last 12 months required",
          "Stock statement and audit report mandatory",
          "Prepayment charges: 4% after lock-in period"
        ]
      }
    ];

    await LoanScheme.insertMany(schemes);
    console.log("Created 5 loan schemes with features and terms!");

    console.log("\n✅ Seed completed!");
    mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

seedLoanSchemes();