const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = "mongodb+srv://kabhishek76673_db_user:coderarmy@cluster0.dsh1bkp.mongodb.net/horizon?appName=Cluster0";

require("./models/Employee");
require("./models/Admin");

async function testLogin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB\n");

    const testCases = [
      { email: "kabhishek76673@gmail.com", password: "admin123" },
      { email: "kabhishek76683@gmail.com", password: "admin123" }
    ];

    const Employee = mongoose.model("Employee");
    const Admin = mongoose.model("Admin");

    for (const test of testCases) {
      console.log(`\n=== Testing: ${test.email} ===`);
      
      // Check Admin collection
      let user = await Admin.findOne({ email: test.email.toLowerCase() });
      let source = "Admin";
      
      // Check Employee collection if not found in Admin
      if (!user) {
        user = await Employee.findOne({ email: test.email.toLowerCase() });
        source = "Employee";
      }

      if (!user) {
        console.log("❌ User NOT FOUND in any collection");
        continue;
      }

      console.log("✅ Found in:", source);
      console.log("   Email:", user.email);
      console.log("   Role:", user.role);
      console.log("   isActive:", user.isActive);
      
      const pwdMatch = await user.comparePassword(test.password);
      console.log("   Password match:", pwdMatch ? "✅ YES" : "❌ NO");
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

testLogin();