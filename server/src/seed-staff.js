const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGO_URI || "mongodb+srv://kabhishek76673_db_user:coderarmy@cluster0.dsh1bkp.mongodb.net/horizon?appName=Cluster0";

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["admin", "manager", "teller", "clerk", "support", "auditor"], 
    default: "clerk" 
  },
  department: { 
    type: String, 
    enum: ["operations", "customer_service", "loans", "accounts", "it", "hr", "finance", "audit"], 
    default: "operations" 
  },
  designation: { type: String },
  isActive: { type: Boolean, default: true },
  joinDate: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

const Employee = mongoose.model("Employee", employeeSchema);

async function createStaff() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const password = "staff123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const existingStaff = await Employee.findOne({ email: "tech.savvy.harsh@gmail.com" });
    
    if (existingStaff) {
      console.log("Staff already exists with this email");
    } else {
      const count = await Employee.countDocuments();
      const employeeId = `EMP${String(count + 1).padStart(6, '0')}`;
      
      await Employee.create({
        employeeId: employeeId,
        firstName: "Harsh",
        lastName: "Tech",
        email: "tech.savvy.harsh@gmail.com",
        password: hashedPassword,
        phone: "9876543210",
        role: "teller",
        department: "operations",
        designation: "Staff",
        isActive: true
      });
      console.log("Staff created successfully!");
    }

    console.log("\nLogin credentials:");
    console.log("Email: tech.savvy.harsh@gmail.com");
    console.log("Password: staff123");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

createStaff();
