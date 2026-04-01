const mongoose = require("mongoose");

const MONGODB_URI = "mongodb+srv://kabhishek76673_db_user:coderarmy@cluster0.dsh1bkp.mongodb.net/horizon?appName=Cluster0";

require("./models/User");
require("./models/Customer");
require("./models/Admin");
require("./models/Employee");
require("./models/BankAccount");

async function checkAllData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("=== CONNECTED TO MONGODB ===\n");

    const User = mongoose.model("User");
    const Customer = mongoose.model("Customer");
    const Employee = mongoose.model("Employee");
    const Admin = mongoose.model("Admin");
    const BankAccount = mongoose.model("BankAccount");

    console.log("=== USERS (collection: users) ===");
    const users = await User.find({}).select("email firstName lastName role isEmailVerified createdAt");
    console.log("Total users:", users.length);
    users.forEach(u => {
      console.log(`  - ${u.email} | ${u.firstName} ${u.lastName} | role: ${u.role} | verified: ${u.isEmailVerified}`);
    });

    console.log("\n=== CUSTOMERS (collection: customers) ===");
    const customers = await Customer.find({}).select("email firstName lastName role isVerified");
    console.log("Total customers:", customers.length);
    customers.forEach(c => {
      console.log(`  - ${c.email} | ${c.firstName} ${c.lastName} | role: ${c.role} | verified: ${c.isVerified}`);
    });

    console.log("\n=== EMPLOYEES (collection: employees) ===");
    const employees = await Employee.find({}).select("email firstName lastName role isActive");
    console.log("Total employees:", employees.length);
    employees.forEach(e => {
      console.log(`  - ${e.email} | ${e.firstName} ${e.lastName} | role: ${e.role} | active: ${e.isActive}`);
    });

    console.log("\n=== ADMINS (collection: admins) ===");
    const admins = await Admin.find({}).select("email firstName lastName role isActive");
    console.log("Total admins:", admins.length);
    admins.forEach(a => {
      console.log(`  - ${a.email} | ${a.firstName} ${a.lastName} | role: ${a.role} | active: ${a.isActive}`);
    });

    console.log("\n=== BANK ACCOUNTS ===");
    const accounts = await BankAccount.find({}).select("accountNumber user email accountType isActive");
    console.log("Total accounts:", accounts.length);
    accounts.forEach(a => {
      console.log(`  - ${a.accountNumber} | ${a.email} | type: ${a.accountType} | active: ${a.isActive}`);
    });

    await mongoose.disconnect();
    console.log("\n=== COMPLETE ===");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

checkAllData();