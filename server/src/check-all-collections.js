const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = "mongodb+srv://kabhishek76673_db_user:coderarmy@cluster0.dsh1bkp.mongodb.net/horizon?appName=Cluster0";

// Load all models
require("./models/User");
require("./models/Customer");
require("./models/Admin");
require("./models/Employee");

async function checkAllCollections() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB\n");

    const targetEmail = "kabhishek76673@gmail.com";
    const targetEmailLower = targetEmail.toLowerCase();

    console.log("=== SEARCHING FOR EMAIL: " + targetEmail + " ===\n");

    // Check customers collection
    try {
      const Customer = mongoose.model("Customer");
      const customer = await Customer.findOne({ email: targetEmailLower });
      if (customer) {
        console.log("✅ FOUND IN customers collection:");
        console.log("   Email:", customer.email);
        console.log("   Role:", customer.role);
        console.log("   isEmailVerified:", customer.isEmailVerified);
        const pwdMatch = await customer.comparePassword("admin123");
        console.log("   Password 'admin123' match:", pwdMatch);
      } else {
        console.log("❌ NOT found in customers collection");
      }
    } catch(e) { console.log("customers collection error:", e.message); }

    // Check users collection
    try {
      const User = mongoose.model("User");
      const user = await User.findOne({ email: targetEmailLower });
      if (user) {
        console.log("✅ FOUND IN users collection:");
        console.log("   Email:", user.email);
        console.log("   Role:", user.role);
        console.log("   isEmailVerified:", user.isEmailVerified);
        const pwdMatch = await user.comparePassword("admin123");
        console.log("   Password 'admin123' match:", pwdMatch);
      } else {
        console.log("❌ NOT found in users collection");
      }
    } catch(e) { console.log("users collection error:", e.message); }

    // Check employees collection
    try {
      const Employee = mongoose.model("Employee");
      const employee = await Employee.findOne({ email: targetEmailLower });
      if (employee) {
        console.log("✅ FOUND IN employees collection:");
        console.log("   Email:", employee.email);
        console.log("   Role:", employee.role);
        console.log("   isActive:", employee.isActive);
        const pwdMatch = await employee.comparePassword("admin123");
        console.log("   Password 'admin123' match:", pwdMatch);
      } else {
        console.log("❌ NOT found in employees collection");
      }
    } catch(e) { console.log("employees collection error:", e.message); }

    // Check admins collection
    try {
      const Admin = mongoose.model("Admin");
      const admin = await Admin.findOne({ email: targetEmailLower });
      if (admin) {
        console.log("✅ FOUND IN admins collection:");
        console.log("   Email:", admin.email);
        console.log("   Role:", admin.role);
        console.log("   isActive:", admin.isActive);
        const pwdMatch = await admin.comparePassword("admin123");
        console.log("   Password 'admin123' match:", pwdMatch);
      } else {
        console.log("❌ NOT found in admins collection");
      }
    } catch(e) { console.log("admins collection error:", e.message); }

    console.log("\n=== ALL USERS IN DATABASE ===");
    try {
      const Customer = mongoose.model("Customer");
      const allCustomers = await Customer.find({}).limit(10).select("email role");
      if (allCustomers.length > 0) {
        console.log("Customers:", allCustomers.map(c => c.email + " (" + c.role + ")").join(", "));
      } else {
        console.log("No customers found");
      }
    } catch(e) { console.log("Error getting customers:", e.message); }

    try {
      const Employee = mongoose.model("Employee");
      const allEmployees = await Employee.find({}).limit(10).select("email role");
      if (allEmployees.length > 0) {
        console.log("Employees:", allEmployees.map(e => e.email + " (" + e.role + ")").join(", "));
      } else {
        console.log("No employees found");
      }
    } catch(e) { console.log("Error getting employees:", e.message); }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

checkAllCollections();