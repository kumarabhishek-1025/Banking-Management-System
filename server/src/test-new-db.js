const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGO_URI || "mongodb+srv://kabhishek76673_db_user:VY8HMclgxmx3HnE8@cluster0.4pwazxk.mongodb.net/?appName=Cluster0";

async function testConnection() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to new MongoDB!");
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name).join(", "));
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    process.exit(1);
  }
}

testConnection();