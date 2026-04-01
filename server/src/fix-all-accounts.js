const mongoose = require("mongoose");

const MONGODB_URI = "mongodb+srv://kabhishek76673_db_user:VY8HMclgxmx3HnE8@cluster0.4pwazxk.mongodb.net/?appName=Cluster0";

require("./models/BankAccount");
require("./models/Customer");

async function fixAllAccounts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("=== CONNECTED ===\n");

    const BankAccount = mongoose.model("BankAccount");
    const Customer = mongoose.model("Customer");

    // Get all customers
    const customers = await Customer.find({});
    const customerMap = {};
    customers.forEach(c => customerMap[c._id.toString()] = c);

    // Update all accounts with customer reference
    const accounts = await BankAccount.find({});
    for (const acc of accounts) {
      const customerId = acc.user?.toString();
      if (customerId && customerMap[customerId]) {
        const customer = customerMap[customerId];
        await BankAccount.findByIdAndUpdate(acc._id, {
          customer: customer._id,
          email: customer.email
        });
        console.log(`✅ Updated account ${acc.accountNumber} with customer ${customer.email}`);
      }
    }

    console.log("\n✅ ALL ACCOUNTS FIXED!");
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

fixAllAccounts();