const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGO_URI || "mongodb+srv://kabhishek76673_db_user:coderarmy@cluster0.dsh1bkp.mongodb.net/horizon?appName=Cluster0";

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const Admin = require("./src/models/Admin");
    const bcrypt = require("bcryptjs");

    const password = "admin123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminData = {
      firstName: "Admin",
      lastName: "User",
      email: "admin@horizonbank.com",
      password: hashedPassword,
      phone: "9876543210",
      role: "admin",
      department: "administration",
      designation: "Administrator",
      isActive: true
    };

    const existingAdmin = await Admin.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log("Admin already exists in Admin collection");
    } else {
      await Admin.create(adminData);
      console.log("Admin created in Admin collection!");
    }

    console.log("\n=== ADMIN LOGIN CREDENTIALS ===");
    console.log("Email: admin@horizonbank.com");
    console.log("Password: admin123");
    console.log("================================\n");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

seedAdmin();
