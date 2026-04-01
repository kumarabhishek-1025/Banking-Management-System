const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = "mongodb+srv://kabhishek76673_db_user:coderarmy@cluster0.dsh1bkp.mongodb.net/horizon?appName=Cluster0";

require("./models/Employee");

async function comprehensiveFix() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB\n");

    const Employee = mongoose.model("Employee");
    const adminEmails = [
      "kabhishek76673@gmail.com",
      "kabhishek76683@gmail.com"
    ];

    console.log("=== FIXING ALL ADMIN ACCOUNTS ===\n");

    for (const email of adminEmails) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);

      let user = await Employee.findOne({ email: email.toLowerCase() });
      
      if (user) {
        await Employee.updateOne(
          { email: email.toLowerCase() },
          { $set: { password: hashedPassword, isActive: true, role: "admin" } }
        );
        console.log(`✅ Updated: ${email}`);
      } else {
        await Employee.create({
          employeeId: "EMP0000" + (adminEmails.indexOf(email) + 1),
          firstName: "Admin",
          lastName: "User",
          email: email.toLowerCase(),
          password: "admin123",
          phone: "9876543210",
          role: "admin",
          department: "operations",
          designation: "Administrator",
          isActive: true
        });
        console.log(`✅ Created: ${email}`);
      }
    }

    console.log("\n=== VERIFYING ALL ACCOUNTS ===\n");

    const allEmployees = await Employee.find({}).select("email role isActive password");
    for (const emp of allEmployees) {
      let pwdOk = false;
      if (emp.password) {
        try {
          pwdOk = await bcrypt.compare("admin123", emp.password);
        } catch(e) {}
      }
      console.log(`- ${emp.email} | role: ${emp.role} | active: ${emp.isActive} | pwd ok: ${pwdOk ? "✅" : "❌"}`);
    }

    console.log("\n=== TESTING LOGIN FLOW ===\n");

    const Admin = require("./models/Admin");
    
    for (const email of adminEmails) {
      const emailLower = email.toLowerCase();
      
      let user = await Admin.findOne({ email: emailLower });
      let userType = "admin";
      
      if (!user) {
        user = await Employee.findOne({ email: emailLower });
        userType = "employee";
      }

      if (user) {
        let isMatch = false;
        if (user.password) {
          try {
            isMatch = await bcrypt.compare("admin123", user.password);
          } catch(e) {}
        }
        console.log(`${email} => Found in ${userType}, pwd match: ${isMatch ? "✅" : "❌"}`);
      } else {
        console.log(`${email} => ❌ NOT FOUND`);
      }
    }

    console.log("\n✅ ALL FIXES COMPLETE!");
    console.log("\nLogin credentials:");
    console.log("Email: kabhishek76673@gmail.com / Password: admin123");
    console.log("Email: kabhishek76683@gmail.com / Password: admin123");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

comprehensiveFix();