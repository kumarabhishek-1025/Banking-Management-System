const mongoose = require("mongoose");

const MONGODB_URI = "mongodb+srv://kabhishek76673_db_user:VY8HMclgxmx3HnE8@cluster0.4pwazxk.mongodb.net/?appName=Cluster0";

require("./models/User");
require("./models/Customer");
require("./models/Employee");
require("./models/Admin");
require("./models/BankAccount");
require("./models/Loan");

async function checkDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("=== CONNECTED ===\n");

    const User = mongoose.model("User");
    const Customer = mongoose.model("Customer");
    const Employee = mongoose.model("Employee");
    const Admin = mongoose.model("Admin");
    const BankAccount = mongoose.model("BankAccount");
    const Loan = mongoose.model("Loan");

    console.log("=== USERS ===");
    const users = await User.find({}).select("email firstName lastName role");
    console.log("Count:", users.length);
    users.forEach(u => console.log(`  - ${u.email} | ${u.firstName} ${u.lastName} | role: ${u.role}`));

    console.log("\n=== CUSTOMERS ===");
    const customers = await Customer.find({}).select("email firstName lastName role isVerified");
    console.log("Count:", customers.length);
    customers.forEach(c => console.log(`  - ${c.email} | ${c.firstName} ${c.lastName} | role: ${c.role}`));

    console.log("\n=== EMPLOYEES ===");
    const employees = await Employee.find({}).select("email firstName lastName role isActive");
    console.log("Count:", employees.length);
    employees.forEach(e => console.log(`  - ${e.email} | ${e.firstName} ${e.lastName} | role: ${e.role}`));

    console.log("\n=== ADMINS ===");
    const admins = await Admin.find({}).select("email firstName lastName role");
    console.log("Count:", admins.length);
    admins.forEach(a => console.log(`  - ${a.email} | ${a.firstName} ${a.lastName} | role: ${a.role}`));

    console.log("\n=== BANK ACCOUNTS ===");
    const accounts = await BankAccount.find({}).select("accountNumber user customer email status");
    console.log("Count:", accounts.length);
    accounts.forEach(a => console.log(`  - ${a.accountNumber} | status: ${a.status}`));

    console.log("\n=== LOANS ===");
    const loans = await Loan.find({}).select("loanType status");
    console.log("Count:", loans.length);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

checkDatabase();