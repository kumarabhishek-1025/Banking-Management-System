const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = "mongodb+srv://kabhishek76673_db_user:coderarmy@cluster0.dsh1bkp.mongodb.net/horizon?appName=Cluster0";

require("./models/User");
require("./models/Customer");
require("./models/Employee");
require("./models/Admin");
require("./models/BankAccount");

async function seedFresh() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("=== CONNECTED ===\n");

    const User = mongoose.model("User");
    const Customer = mongoose.model("Customer");
    const Employee = mongoose.model("Employee");
    const BankAccount = mongoose.model("BankAccount");

    // 1. Create Admin (in Employee collection)
    console.log("=== CREATING ADMIN ===");
    const adminPassword = "admin123";
    const admin = await Employee.create({
      employeeId: "EMP001",
      firstName: "Admin",
      lastName: "User",
      email: "kabhishek76673@gmail.com",
      password: adminPassword,
      phone: "9876543210",
      role: "admin",
      department: "operations",
      designation: "Super Administrator",
      isActive: true
    });
    console.log("✅ Admin created: kabhishek76673@gmail.com / admin123");

    // 2. Create Customer
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
    console.log("✅ Customer created: john.doe@example.com / customer123");

    // 3. Create Bank Account for Customer
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
    console.log("✅ Bank Account created: 1234567890");

    // 4. Create Staff Member
    console.log("\n=== CREATING STAFF ===");
    const staff = await Employee.create({
      employeeId: "EMP002",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@horizonbank.com",
      password: "staff123",
      phone: "9876543211",
      role: "teller",
      department: "operations",
      designation: "Teller",
      isActive: true
    });
    console.log("✅ Staff created: jane.smith@horizonbank.com / staff123");

    // Summary
    console.log("\n=== SUMMARY ===");
    console.log("Collections after seeding:");
    console.log("  - Users:", await User.countDocuments());
    console.log("  - Customers:", await Customer.countDocuments());
    console.log("  - Employees (Admin + Staff):", await Employee.countDocuments());
    console.log("  - Bank Accounts:", await BankAccount.countDocuments());

    console.log("\n=== LOGIN CREDENTIALS ===");
    console.log("Admin: kabhishek76673@gmail.com / admin123");
    console.log("Customer: john.doe@example.com / customer123");
    console.log("Staff: jane.smith@horizonbank.com / staff123");

    await mongoose.disconnect();
    console.log("\n✅ FRESH DATABASE SEEDED!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

seedFresh();