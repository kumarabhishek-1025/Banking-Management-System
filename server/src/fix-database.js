const mongoose = require("mongoose");

const MONGODB_URI = "mongodb+srv://kabhishek76673_db_user:coderarmy@cluster0.dsh1bkp.mongodb.net/horizon?appName=Cluster0";

require("./models/User");
require("./models/Customer");
require("./models/Employee");
require("./models/Admin");
require("./models/BankAccount");

async function fixDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("=== CONNECTED ===\n");

    const User = mongoose.model("User");
    const Customer = mongoose.model("Customer");
    const Employee = mongoose.model("Employee");
    const Admin = mongoose.model("Admin");
    const BankAccount = mongoose.model("BankAccount");

    // Step 1: Remove incorrect admin from User collection
    console.log("=== STEP 1: CLEANING USER COLLECTION ===");
    const adminInUsers = await User.findOne({ email: "kabhishek76683@gmail.com" });
    if (adminInUsers) {
      // Move this user properly - create as customer or remove
      // Let's convert it to a proper customer by creating in Customer collection
      await Customer.create({
        firstName: adminInUsers.firstName,
        lastName: adminInUsers.lastName,
        email: adminInUsers.email,
        password: adminInUsers.password, // Will be hashed by pre-save
        phone: adminInUsers.phone || "",
        role: "customer",
        isVerified: true,
        isActive: true
      });
      console.log("✅ Created customer from User collection admin");
      
      // Now delete from User collection
      await User.deleteOne({ email: "kabhishek76683@gmail.com" });
      console.log("✅ Removed from User collection");
    }

    // Step 2: Make sure admin accounts are properly in Employee collection only
    console.log("\n=== STEP 2: VERIFYING EMPLOYEE COLLECTION ===");
    const adminEmails = ["kabhishek76673@gmail.com", "kabhishek76683@gmail.com"];
    for (const email of adminEmails) {
      let emp = await Employee.findOne({ email: email.toLowerCase() });
      if (!emp) {
        // Create admin in Employee collection
        const bcrypt = require("bcryptjs");
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("admin123", salt);
        
        emp = await Employee.create({
          employeeId: "EMP" + Date.now().toString().slice(-6),
          firstName: "Admin",
          lastName: "User",
          email: email.toLowerCase(),
          password: "admin123",
          phone: "9876543210",
          role: "admin",
          department: "administration",
          designation: "Administrator",
          isActive: true
        });
        console.log(`✅ Created admin: ${email}`);
      } else {
        console.log(`✅ Admin exists: ${email}`);
      }
    }

    // Step 3: Fix bank account to link to customer properly
    console.log("\n=== STEP 3: FIXING BANK ACCOUNTS ===");
    const accounts = await BankAccount.find({});
    for (const acc of accounts) {
      if (acc.user && !acc.customer) {
        // Link to customer
        const customer = await Customer.findOne({ email: { $exists: true } });
        if (customer) {
          acc.customer = customer._id;
          acc.email = customer.email;
          acc.status = "active";
          await acc.save();
          console.log(`✅ Fixed account ${acc.accountNumber}`);
        }
      }
    }

    // Final check
    console.log("\n=== FINAL DATABASE STATE ===");
    console.log("Users:", await User.countDocuments());
    console.log("Customers:", await Customer.countDocuments());
    console.log("Employees:", await Employee.countDocuments());
    console.log("Admins:", await Admin.countDocuments());
    console.log("Accounts:", await BankAccount.countDocuments());

    await mongoose.disconnect();
    console.log("\n✅ DATABASE FIXED!");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

fixDatabase();