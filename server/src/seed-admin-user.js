const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGO_URI || "mongodb+srv://kabhishek76673_db_user:coderarmy@cluster0.dsh1bkp.mongodb.net/horizon?appName=Cluster0";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true },
  address1: { type: String },
  city: { type: String },
  state: { type: String },
  postalCode: { type: String },
  dateOfBirth: { type: String },
  ssn: { type: String },
  dwollaCustomerId: { type: String },
  dwollaCustomerUrl: { type: String },
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
  isEmailVerified: { type: Boolean, default: false },
  verificationOTP: { type: String },
  verificationOTPExpiry: { type: Date },
  tempUserData: { type: Object },
}, { timestamps: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model("User", userSchema);

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const email = "kabhishek76683@gmail.com";
    const password = "admin123";

    const existingAdmin = await User.findOne({ email, role: "admin" });
    
    if (existingAdmin) {
      console.log("Admin user already exists in User collection");
    } else {
      await User.create({
        firstName: "Admin",
        lastName: "User",
        email: email,
        password: password,
        role: "admin",
        isEmailVerified: true
      });
      console.log("Admin user created in User collection!");
    }

    console.log("\nLogin credentials:");
    console.log("Email: " + email);
    console.log("Password: " + password);
    console.log("Role: admin");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

createAdmin();
