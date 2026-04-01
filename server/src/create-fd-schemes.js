const mongoose = require("mongoose");

const MONGODB_URI = "mongodb+srv://kabhishek76673_db_user:VY8HMclgxmx3HnE8@cluster0.4pwazxk.mongodb.net/?appName=Cluster0";

require("./models/DepositScheme");

async function createFixedDepositSchemes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("=== CONNECTED ===\n");

    const DepositScheme = mongoose.model("DepositScheme");

    // Clear existing and create new fixed deposit schemes
    await DepositScheme.deleteMany({});

    const schemes = [
      {
        name: "Regular Fixed Deposit",
        type: "fixed",
        description: "Our most popular fixed deposit scheme with competitive interest rates and flexible tenure options. Ideal for conservative investors looking for guaranteed returns.",
        minAmount: 1000,
        maxAmount: 10000000,
        minTenureMonths: 7,
        maxTenureMonths: 120,
        interestRate: 6.5,
        interestType: "compound",
        compoundingFrequency: "quarterly",
        seniorCitizenRate: 7.0,
        specialRate: 7.25,
        specialRateMinAmount: 100000,
        specialRateTenureMonths: 12,
        isActive: true,
        isDefault: true,
        features: [
          "Higher interest rates for senior citizens",
          "Loan facility available up to 75% of deposit",
          "Auto-renewal option available",
          "Nomination facility available"
        ],
        terms: [
          "Interest calculated on quarterly basis",
          "Premature withdrawal allowed with reduced interest",
          "Tax benefits available under Section 80C"
        ]
      },
      {
        name: "Tax Saver Fixed Deposit",
        type: "fixed",
        description: "Save tax while earning guaranteed returns. Perfect for tax planning with benefits under Section 80C of Income Tax Act.",
        minAmount: 100,
        maxAmount: 150000,
        minTenureMonths: 60,
        maxTenureMonths: 60,
        interestRate: 7.0,
        interestType: "compound",
        compoundingFrequency: "quarterly",
        seniorCitizenRate: 7.5,
        specialRate: null,
        specialRateMinAmount: null,
        specialRateTenureMonths: null,
        isActive: true,
        isDefault: false,
        features: [
          "Tax benefits up to ₹1.5 Lakhs under Section 80C",
          "Higher rates for senior citizens",
          "5 year lock-in period",
          "Can be used as collateral for loans"
        ],
        terms: [
          "Minimum tenure of 5 years",
          "No premature withdrawal allowed",
          "Tax benefits applicable as per current IT laws"
        ]
      },
      {
        name: "Short Term Fixed Deposit",
        type: "fixed",
        description: "Ideal for short-term investment needs with competitive interest rates and quick withdrawal options.",
        minAmount: 5000,
        maxAmount: 5000000,
        minTenureMonths: 7,
        maxTenureMonths: 12,
        interestRate: 5.5,
        interestType: "simple",
        compoundingFrequency: "annually",
        seniorCitizenRate: 6.0,
        specialRate: null,
        specialRateMinAmount: null,
        specialRateTenureMonths: null,
        isActive: true,
        isDefault: false,
        features: [
          "Ideal for short-term goals",
          "Higher rates for senior citizens",
          "Flexible interest payout options",
          "Quick processing and release"
        ],
        terms: [
          "Interest calculated on annual basis",
          "7 days grace period after maturity",
          "Premature withdrawal allowed"
        ]
      },
      {
        name: "Long Term Gold Plan",
        type: "fixed",
        description: "Best returns for long-term investment with premium interest rates and maximum tax benefits.",
        minAmount: 10000,
        maxAmount: 50000000,
        minTenureMonths: 36,
        maxTenureMonths: 120,
        interestRate: 7.5,
        interestType: "compound",
        compoundingFrequency: "quarterly",
        seniorCitizenRate: 8.0,
        specialRate: 8.25,
        specialRateMinAmount: 500000,
        specialRateTenureMonths: 60,
        isActive: true,
        isDefault: false,
        features: [
          "Highest interest rates for long-term",
          "Special rates for bulk deposits",
          "Quarterly interest payout option",
          "Loan facility up to 80% of deposit"
        ],
        terms: [
          "Interest compounded quarterly",
          "Minimum 3 year tenure",
          "Premature withdrawal with 1% penalty"
        ]
      },
      {
        name: "NRI Fixed Deposit",
        type: "fixed",
        description: "Special deposit scheme for Non-Resident Indians with attractive interest rates and easy repatriation.",
        minAmount: 10000,
        maxAmount: 10000000,
        minTenureMonths: 12,
        maxTenureMonths: 60,
        interestRate: 7.25,
        interestType: "compound",
        compoundingFrequency: "quarterly",
        seniorCitizenRate: null,
        specialRate: null,
        specialRateMinAmount: null,
        specialRateTenureMonths: null,
        isActive: true,
        isDefault: false,
        features: [
          "Designed for NRI customers",
          "Easy repatriation of funds",
          "Higher interest rates",
          "NRO/NRE account support"
        ],
        terms: [
          "Valid PAN card required",
          "Interest as per FEMA guidelines",
          "Premature withdrawal allowed with notice"
        ]
      }
    ];

    for (const scheme of schemes) {
      await DepositScheme.create(scheme);
      console.log(`✅ Created: ${scheme.name}`);
    }

    console.log("\n=== SUMMARY ===");
    console.log("Total Fixed Deposit Schemes:", await DepositScheme.countDocuments());

    await mongoose.disconnect();
    console.log("\n✅ DONE!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

createFixedDepositSchemes();