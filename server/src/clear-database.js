const mongoose = require("mongoose");

const MONGODB_URI = "mongodb+srv://kabhishek76673_db_user:coderarmy@cluster0.dsh1bkp.mongodb.net/horizon?appName=Cluster0";

async function deleteAllCollections() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB\n");

    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log("Collections found:", collections.map(c => c.name).join(", "));

    // Delete all collections
    for (const coll of collections) {
      await db.collection(coll.name).deleteMany({});
      console.log(`✅ Deleted all documents from: ${coll.name}`);
    }

    console.log("\n✅ ALL DATABASE COLLECTIONS CLEARED!");
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

deleteAllCollections();