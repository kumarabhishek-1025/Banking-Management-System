const mongoose = require("mongoose");

const MONGODB_URI = "mongodb+srv://kabhishek76673_db_user:coderarmy@cluster0.dsh1bkp.mongodb.net/horizon?appName=Cluster0";

require("./models/User");
require("./models/Customer");
require("./models/Admin");
require("./models/Employee");
require("./models/BankAccount");

async function comprehensiveCheck() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("=== MONGODB CONNECTED ===\n");

    const User = mongoose.model("User");
    const Customer = mongoose.model("Customer");
    const Employee = mongoose.model("Employee");
    const Admin = mongoose.model("Admin");
    const BankAccount = mongoose.model("BankAccount");

    console.log("=== 1. USER COLLECTION ===");
    const users = await User.find({}).select("email firstName lastName role isEmailVerified createdAt");
    console.log("Total:", users.length);
    users.forEach(u => console.log(`  - ${u.email} | ${u.firstName} ${u.lastName} | role: ${u.role} | verified: ${u.isEmailVerified}`));

    console.log("\n=== 2. CUSTOMER COLLECTION ===");
    const customers = await Customer.find({}).select("email firstName lastName role isVerified createdAt");
    console.log("Total:", customers.length);
    customers.forEach(c => console.log(`  - ${c.email} | ${c.firstName} ${c.lastName} | role: ${c.role} | verified: ${c.isVerified}`));

    console.log("\n=== 3. EMPLOYEE COLLECTION (Staff + Admins) ===");
    const employees = await Employee.find({}).select("email firstName lastName role isActive createdAt");
    console.log("Total:", employees.length);
    employees.forEach(e => console.log(`  - ${e.email} | ${e.firstName} ${e.lastName} | role: ${e.role} | active: ${e.isActive}`));

    console.log("\n=== 4. ADMIN COLLECTION ===");
    const admins = await Admin.find({}).select("email firstName lastName role isActive createdAt");
    console.log("Total:", admins.length);
    admins.forEach(a => console.log(`  - ${a.email} | ${a.firstName} ${a.lastName} | role: ${a.role} | active: ${a.isActive}`));

    console.log("\n=== 5. BANK ACCOUNTS ===");
    const accounts = await BankAccount.find({}).select("accountNumber user customer email accountType status balance createdAt");
    console.log("Total:", accounts.length);
    accounts.forEach(a => console.log(`  - ${a.accountNumber} | userId: ${a.user || 'none'} | custId: ${a.customer || 'none'} | email: ${a.email} | type: ${a.accountType} | status: ${a.status} | balance: ${a.balance}`));

    // Categorize properly
    console.log("\n=== SUMMARY ===");
    console.log("Customers (User collection):", users.filter(u => u.role === 'customer' || u.role === 'user').length);
    console.log("Customers (Customer collection):", customers.length);
    console.log("Staff/Employees:", employees.filter(e => e.role !== 'admin').length);
    console.log("Admin Users:", employees.filter(e => e.role === 'admin').length);
    console.log("Admin Collection:", admins.length);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

comprehensiveCheck();