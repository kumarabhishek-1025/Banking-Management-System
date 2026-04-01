const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = "mongodb+srv://kabhishek76673_db_user:coderarmy@cluster0.dsh1bkp.mongodb.net/horizon?appName=Cluster0";

require("./models/Employee");

async function fixPassword() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB\n");

    const Employee = mongoose.model("Employee");
    const targetEmail = "kabhishek76673@gmail.com";
    const newPassword = "admin123";

    // Hash password exactly like the model does (salt 10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update directly without triggering pre-save hook
    await Employee.updateOne(
      { email: targetEmail },
      { $set: { password: hashedPassword } }
    );
    
    console.log("✅ Password updated for", targetEmail);

    // Verify by fetching fresh
    const verify = await Employee.findOne({ email: targetEmail }).select("+password");
    const match = await verify.comparePassword(newPassword);
    console.log("Password verification:", match ? "✅ SUCCESS" : "❌ FAILED");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

fixPassword();