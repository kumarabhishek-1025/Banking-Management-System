const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = "mongodb+srv://kabhishek76673_db_user:coderarmy@cluster0.dsh1bkp.mongodb.net/horizon?appName=Cluster0";

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, default: "admin" },
  department: { type: String, default: "operations" },
  designation: { type: String },
  isActive: { type: Boolean, default: true },
  joinDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

employeeSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

const Employee = mongoose.model("Employee", employeeSchema);

async function createAdmins() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB\n");

    // Create/update admin for kabhishek76673@gmail.com
    const email1 = "kabhishek76673@gmail.com";
    const password = "admin123";

    let admin1 = await Employee.findOne({ email: email1 });
    
    if (admin1) {
      console.log("Admin kabhishek76673@gmail.com already exists");
    } else {
      admin1 = await Employee.create({
        employeeId: "EMP000002",
        firstName: "Admin",
        lastName: "User",
        email: email1,
        password: password,
        phone: "9876543210",
        role: "admin",
        department: "operations",
        designation: "Administrator",
        isActive: true
      });
      console.log("✅ Created admin: kabhishek76673@gmail.com");
    }

    // Also check/update the other admin
    const email2 = "kabhishek76683@gmail.com";
    let admin2 = await Employee.findOne({ email: email2 });
    
    if (admin2) {
      // Ensure password is correct
      const pwdMatch = await admin2.comparePassword("admin123");
      if (!pwdMatch) {
        admin2.password = "admin123";
        await admin2.save();
        console.log("✅ Updated password for kabhishek76683@gmail.com");
      }
    }

    console.log("\n=== ALL ADMINS IN DATABASE ===");
    const allAdmins = await Employee.find({ role: "admin" }).select("email role isActive");
    allAdmins.forEach(a => {
      console.log(`- ${a.email} (role: ${a.role}, active: ${a.isActive})`);
    });

    console.log("\n=== LOGIN CREDENTIALS ===");
    console.log("Option 1: kabhishek76673@gmail.com / admin123");
    console.log("Option 2: kabhishek76683@gmail.com / admin123");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

createAdmins();