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

employeeSchema.pre("save", async function(next) {
  if (!this.employeeId) {
    this.employeeId = "EMP000001";
  }
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

employeeSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

const Employee = mongoose.model("Employee", employeeSchema);

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const email = "kabhishek76683@gmail.com";
    const password = "admin123";

    // Check if admin already exists in Employee collection
    const existingEmployee = await Employee.findOne({ email: email.toLowerCase() });
    
    if (existingEmployee) {
      console.log("Admin already exists in Employee collection");
      console.log("Found user:", existingEmployee.email, existingEmployee.role);
    } else {
      const admin = await Employee.create({
        employeeId: "EMP000001",
        firstName: "Admin",
        lastName: "User",
        email: email.toLowerCase(),
        password: password,
        phone: "9876543210",
        role: "admin",
        department: "operations",
        designation: "Administrator",
        isActive: true
      });
      console.log("Admin created successfully in Employee collection!");
      console.log("Created with email:", admin.email);
    }

    // Also try to find in Admin collection
    const Admin = mongoose.model("Admin", new mongoose.Schema({
      email: { type: String, lowercase: true }
    }));
    
    const existingAdmin = await mongoose.connection.db.collection("admins").findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      console.log("Admin also exists in Admin collection");
    }

    console.log("\n=== Login Info ===");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Use: http://localhost:5173/admin-login");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

createAdmin();