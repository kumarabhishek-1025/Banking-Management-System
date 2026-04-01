const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = "mongodb+srv://kabhishek76673_db_user:VY8HMclgxmx3HnE8@cluster0.4pwazxk.mongodb.net/?appName=Cluster0";

require("./models/User");
require("./models/Customer");
require("./models/Employee");
require("./models/Admin");
require("./models/BankAccount");
require("./models/Loan");
require("./models/LoanScheme");

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("=== CONNECTED ===\n");

    const Customer = mongoose.model("Customer");
    const Employee = mongoose.model("Employee");
    const BankAccount = mongoose.model("BankAccount");
    const LoanScheme = mongoose.model("LoanScheme");

    // 1. Create Admin (kabhishek76683@gmail.com)
    console.log("=== CREATING ADMIN ===");
    const admin = await Employee.create({
      employeeId: "EMP001",
      firstName: "Admin",
      lastName: "User",
      email: "kabhishek76683@gmail.com",
      password: "admin@123",
      phone: "9876543210",
      role: "admin",
      department: "operations",
      designation: "Super Administrator",
      isActive: true
    });
    console.log("✅ Admin: kabhishek76683@gmail.com / admin@123");

    // 2. Create Staff
    console.log("\n=== CREATING STAFF ===");
    const staff = await Employee.create({
      employeeId: "EMP002",
      firstName: "John",
      lastName: "Staff",
      email: "staff@horizonbank.com",
      password: "staff@123",
      phone: "9876543211",
      role: "teller",
      department: "operations",
      designation: "Teller",
      isActive: true
    });
    console.log("✅ Staff: staff@horizonbank.com / staff@123");

    // 3. Create Customer
    console.log("\n=== CREATING CUSTOMER ===");
    const customer = await Customer.create({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      password: "customer123",
      phone: "1234567890",
      address: "123 Main Street",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      role: "customer",
      isVerified: true,
      isActive: true
    });
    console.log("✅ Customer: john.doe@example.com / customer123");

    // 4. Create Bank Account for Customer
    console.log("\n=== CREATING BANK ACCOUNT ===");
    const account = await BankAccount.create({
      user: customer._id,
      accountNumber: "1234567890",
      routingNumber: "RN123456789",
      accountType: "checking",
      bankName: "Horizon Bank",
      branchName: "Main Branch",
      ifscCode: "HZB001",
      balance: 50000,
      availableBalance: 50000,
      status: "active"
    });
    console.log("✅ Bank Account: 1234567890");

    // 5. Create Loan Schemes
    console.log("\n=== CREATING LOAN SCHEMES ===");
    const loanSchemes = [
      {
        name: "Home Loan",
        type: "home",
        description: "Buy your dream home with our competitive home loan. Low interest rates and flexible repayment options.",
        minAmount: 100000,
        maxAmount: 50000000,
        interestRate: 8.5,
        tenureMin: 60,
        tenureMax: 360,
        eligibility: "Any Indian resident above 21 years with stable income",
        documents: ["Aadhaar Card", "PAN Card", "Income Proof", "Property Documents"],
        processingFee: 0.5,
        status: "active"
      },
      {
        name: "Car Loan",
        type: "car",
        description: "Finance your new car with our hassle-free car loan. Quick approval and flexible EMIs.",
        minAmount: 100000,
        maxAmount: 10000000,
        interestRate: 9.0,
        tenureMin: 12,
        tenureMax: 84,
        eligibility: "Any Indian resident with valid driving license",
        documents: ["Aadhaar Card", "PAN Card", "Income Proof", "Car Quotation"],
        processingFee: 0.3,
        status: "active"
      },
      {
        name: "Personal Loan",
        type: "personal",
        description: "Meet your personal financial needs with our flexible personal loan. No collateral required.",
        minAmount: 50000,
        maxAmount: 5000000,
        interestRate: 12.0,
        tenureMin: 12,
        tenureMax: 60,
        eligibility: "Any Indian resident with stable income and good credit score",
        documents: ["Aadhaar Card", "PAN Card", "Income Proof", "Bank Statements"],
        processingFee: 1.0,
        status: "active"
      },
      {
        name: "Education Loan",
        type: "education",
        description: "Fund your education dreams with our education loan. Low interest rates for students.",
        minAmount: 50000,
        maxAmount: 20000000,
        interestRate: 7.5,
        tenureMin: 12,
        tenureMax: 180,
        eligibility: "Indian students admitted to recognized institutions",
        documents: ["Aadhaar Card", "PAN Card", "Admission Letter", "Income Proof"],
        processingFee: 0.25,
        status: "active"
      },
      {
        name: "Business Loan",
        type: "business",
        description: "Grow your business with our flexible business loans. Competitive rates for entrepreneurs.",
        minAmount: 100000,
        maxAmount: 50000000,
        interestRate: 14.0,
        tenureMin: 12,
        tenureMax: 120,
        eligibility: "Business owners with minimum 2 years of operation",
        documents: ["Aadhaar Card", "PAN Card", "Business Registration", "Financial Statements"],
        processingFee: 1.5,
        status: "active"
      }
    ];

    for (const scheme of loanSchemes) {
      await LoanScheme.create(scheme);
      console.log(`✅ Loan Scheme: ${scheme.name}`);
    }

    // Summary
    console.log("\n=== SUMMARY ===");
    console.log("Employees:", await Employee.countDocuments());
    console.log("Customers:", await Customer.countDocuments());
    console.log("Bank Accounts:", await BankAccount.countDocuments());
    console.log("Loan Schemes:", await LoanScheme.countDocuments());

    console.log("\n=== LOGIN CREDENTIALS ===");
    console.log("Admin:   kabhishek76683@gmail.com / admin@123");
    console.log("Staff:   staff@horizonbank.com / staff@123");
    console.log("Customer: john.doe@example.com / customer123");

    await mongoose.disconnect();
    console.log("\n✅ DATABASE SEEDED!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

seedDatabase();