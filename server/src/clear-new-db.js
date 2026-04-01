const mongoose = require("mongoose");

const MONGODB_URI = "mongodb+srv://kabhishek76673_db_user:VY8HMclgxmx3HnE8@cluster0.4pwazxk.mongodb.net/?appName=Cluster0";

async function clearAndSeed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("=== CONNECTED ===\n");
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    // Delete all data
    for (const coll of collections) {
      await db.collection(coll.name).deleteMany({});
      console.log(`✅ Cleared: ${coll.name}`);
    }
    
    console.log("\n=== DATABASE CLEARED ===");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

clearAndSeed();