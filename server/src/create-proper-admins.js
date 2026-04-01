const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = "mongodb+srv://kabhishek76673_db_user:VY8HMclgxmx3HnE8@cluster0.4pwazxk.mongodb.net/?appName=Cluster0";

require("./models/Customer");
require("./models/Employee");
require("./models/Admin");
require("./models/BankAccount");
require("./models/LoanScheme");

async function createProperAdmins() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("=== CONNECTED ===\n");

    const Admin = mongoose.model("Admin");
    const Employee = mongoose.model("Employee");
    const Customer = mongoose.model("Customer");
    const BankAccount = mongoose.model("BankAccount");
    const LoanScheme = mongoose.model("LoanScheme");

    // 1. Create ADMIN in ADMINS collection - kabhishek76683@gmail.com
    console.log("=== CREATING ADMIN IN ADMINS COLLECTION ===");
    await Admin.deleteMany({});
    
    const admin = await Admin.create({
      adminId: "ADMIN001",
      firstName: "Admin",
      lastName: "User",
      email: "kabhishek76683@gmail.com",
      password: "admin@123",
      phone: "9876543210",
      role: "admin",
      department: "administration",
      designation: "Super Administrator",
      isActive: true
    });
    console.log("✅ ADMIN CREATED in admins collection: kabhishek76683@gmail.com / admin@123");

    // 2. Create Staff in EMPLOYEES collection (separate from admin)
    console.log("\n=== CREATING STAFF IN EMPLOYEES COLLECTION ===");
    await Employee.deleteMany({});
    
    const staff = await Employee.create({
      employeeId: "EMP001",
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
    console.log("✅ STAFF CREATED in employees collection: staff@horizonbank.com / staff@123");

    // 3. Create Customer
    console.log("\n=== CREATING CUSTOMER ===");
    const customer = await Customer.create({
      firstName: "John",
      lastName: "Doe",
      email: "customer@example.com",
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
    console.log("✅ CUSTOMER CREATED: customer@example.com / customer123");

    // 4. Create Bank Account
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
    console.log("✅ BANK ACCOUNT: 1234567890");

    // 5. Create Loan Schemes
    console.log("\n=== CREATING LOAN SCHEMES ===");
    await LoanScheme.deleteMany({});
    
    const schemes = [
      { name: "Home Loan", type: "home", description: "Buy your dream home", minAmount: 100000, maxAmount: 50000000, interestRate: 8.5, tenureMin: 60, tenureMax: 360, eligibility: "Income proof required", documents: ["ID", "Address"], processingFee: 0.5, status: "active" },
      { name: "Car Loan", type: "car", description: "Finance your new car", minAmount: 100000, maxAmount: 10000000, interestRate: 9.0, tenureMin: 12, tenureMax: 84, eligibility: "Valid license", documents: ["ID", "Income"], processingFee: 0.3, status: "active" },
      { name: "Personal Loan", type: "personal", description: "Meet your needs", minAmount: 50000, maxAmount: 5000000, interestRate: 12.0, tenureMin: 12, tenureMax: 60, eligibility: "Good credit score", documents: ["ID", "Bank Statement"], processingFee: 1.0, status: "active" },
      { name: "Education Loan", type: "education", description: "Fund your education", minAmount: 50000, maxAmount: 20000000, interestRate: 7.5, tenureMin: 12, tenureMax: 180, eligibility: "Admission letter", documents: ["ID", "Admission"], processingFee: 0.25, status: "active" },
      { name: "Business Loan", type: "business", description: "Grow your business", minAmount: 100000, maxAmount: 50000000, interestRate: 14.0, tenureMin: 12, tenureMax: 120, eligibility: "2 years operation", documents: ["ID", "Business docs"], processingFee: 1.5, status: "active" }
    ];

    for (const s of schemes) await LoanScheme.create(s);
    console.log("✅ 5 LOAN SCHEMES CREATED");

    // Summary
    console.log("\n=== FINAL SUMMARY ===");
    console.log("ADMINS collection:", await Admin.countDocuments(), "docs");
    console.log("EMPLOYEES collection:", await Employee.countDocuments(), "docs");

    console.log("\n=== COLLECTIONS IN MONGODB ===");
    console.log("📁 admins collection -> kabhishek76683@gmail.com (role: admin)");
    console.log("📁 employees collection -> staff@horizonbank.com (role: teller)");

    console.log("\n=== LOGIN CREDENTIALS ===");
    console.log("🎯 ADMIN: kabhishek76683@gmail.com / admin@123 (in ADMINS collection)");
    console.log("👨‍💼 STAFF: staff@horizonbank.com / staff@123 (in EMPLOYEES collection)");
    console.log("👤 CUSTOMER: customer@example.com / customer123");

    await mongoose.disconnect();
    console.log("\n✅ DONE!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

createProperAdmins();