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

async function checkAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const email = "kabhishek76683@gmail.com";
    const password = "admin123";

    const admin = await Employee.findOne({ email: email.toLowerCase() });
    
    if (!admin) {
      console.log("No admin found with this email!");
    } else {
      console.log("Admin found:", {
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        firstName: admin.firstName,
        lastName: admin.lastName
      });
      
      // Test password
      const isMatch = await admin.comparePassword(password);
      console.log("Password test:", isMatch ? "✓ CORRECT" : "✗ INCORRECT");
      
      if (!isMatch) {
        // Reset password to admin123
        admin.password = "admin123";
        await admin.save();
        console.log("Password reset to 'admin123'");
      }
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

checkAdmin();