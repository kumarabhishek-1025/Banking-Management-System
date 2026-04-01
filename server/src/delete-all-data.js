const mongoose = require("mongoose");

const MONGODB_URI = "mongodb+srv://kabhishek76673_db_user:coderarmy@cluster0.dsh1bkp.mongodb.net/horizon?appName=Cluster0";

async function deleteAllData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to horizon database\n");
    
    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name).join(", "));
    
    // Delete all documents from each collection
    for (const coll of collections) {
      await db.collection(coll.name).deleteMany({});
      console.log(`✅ Deleted all from: ${coll.name}`);
    }
    
    console.log("\n✅ ALL DATA DELETED FROM HORIZON DATABASE!");
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

deleteAllData();