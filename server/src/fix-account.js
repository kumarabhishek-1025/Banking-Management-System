const mongoose = require("mongoose");

const MONGODB_URI = "mongodb+srv://kabhishek76673_db_user:VY8HMclgxmx3HnE8@cluster0.4pwazxk.mongodb.net/?appName=Cluster0";

require("./models/BankAccount");
require("./models/Customer");

async function fixAccount() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("=== CONNECTED ===\n");

    const BankAccount = mongoose.model("BankAccount");
    const Customer = mongoose.model("Customer");

    // Get the customer
    const customer = await Customer.findOne({ email: "customer@example.com" });
    console.log("Customer:", customer._id);

    // Update account to add customer reference
    const account = await BankAccount.findOneAndUpdate(
      { accountNumber: "1234567890" },
      { customer: customer._id, email: customer.email },
      { new: true }
    );

    console.log("Account updated with customer reference:", account.email);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

fixAccount();