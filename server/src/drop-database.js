const mongoose = require("mongoose");

const MONGODB_URI = "mongodb+srv://kabhishek76673_db_user:coderarmy@cluster0.dsh1bkp.mongodb.net/horizon?appName=Cluster0";

async function dropDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB\n");
    
    // Drop the entire database
    await mongoose.connection.dropDatabase();
    console.log("✅ DATABASE DROPPED: horizon");
    
    await mongoose.disconnect();
    console.log("✅ DISCONNECTED");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

dropDatabase();