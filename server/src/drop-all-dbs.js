const mongoose = require("mongoose");

const MONGODB_URI = "mongodb+srv://kabhishek76673_db_user:coderarmy@cluster0.dsh1bkp.mongodb.net/?appName=Cluster0";

async function dropAllTestDatabases() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB\n");
    
    const db = mongoose.connection.db;
    
    // List all databases
    const admin = db.admin();
    const dbs = await admin.listDatabases();
    
    console.log("All databases:");
    dbs.databases.forEach(d => console.log(`  - ${d.name} (${d.sizeOnDisk / 1024 / 1024} MB)`));
    
    // Drop all test databases (exclude system and main)
    for (const d of dbs.databases) {
      if (d.name !== 'admin' && d.name !== 'local') {
        await mongoose.connection.db.admin().command({ dropDatabase: d.name });
        console.log(`✅ Dropped: ${d.name}`);
      }
    }
    
    console.log("\n✅ ALL USER DATABASES CLEARED!");
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

dropAllTestDatabases();