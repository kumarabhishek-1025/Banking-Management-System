const mongoose = require("mongoose");

const MONGODB_URI = "mongodb+srv://kabhishek76673_db_user:VY8HMclgxmx3HnE8@cluster0.4pwazxk.mongodb.net/?appName=Cluster0";

require("./models/BankAccount");
require("./models/Customer");

async function checkAccounts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("=== CONNECTED ===\n");

    const BankAccount = mongoose.model("BankAccount");
    const Customer = mongoose.model("Customer");

    const accounts = await BankAccount.find({});
    console.log("=== BANK ACCOUNTS ===");
    accounts.forEach(a => {
      console.log(`Account: ${a.accountNumber}`);
      console.log(`  Status: ${a.status}`);
      console.log(`  Balance: ${a.balance}`);
      console.log(`  User ID: ${a.user}`);
      console.log(`  Email: ${a.email}`);
    });

    // Check if user exists
    console.log("\n=== CUSTOMERS ===");
    const customers = await Customer.find({});
    customers.forEach(c => {
      console.log(`Customer: ${c.email} (${c._id})`);
    });

    // Check if we need to fix user reference
    if (accounts.length > 0 && accounts[0].user) {
      const userExists = await Customer.findById(accounts[0].user);
      console.log("\nUser exists in customers:", !!userExists);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

checkAccounts();