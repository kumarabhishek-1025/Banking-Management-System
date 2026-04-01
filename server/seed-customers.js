const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGO_URI || "mongodb+srv://kabhishek76673_db_user:coderarmy@cluster0.dsh1bkp.mongodb.net/horizon?appName=Cluster0";

async function seedCustomers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const Customer = require("./src/models/Customer");
    const bcrypt = require("bcryptjs");

    const customers = [
      {
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@example.com",
        password: "password123",
        phone: "9876543201",
        city: "Mumbai",
        state: "Maharashtra",
        isEmailVerified: true
      },
      {
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@example.com",
        password: "password123",
        phone: "9876543202",
        city: "Delhi",
        state: "Delhi",
        isEmailVerified: true
      },
      {
        firstName: "Michael",
        lastName: "Brown",
        email: "michael.brown@example.com",
        password: "password123",
        phone: "9876543203",
        city: "Bangalore",
        state: "Karnataka",
        isEmailVerified: true
      },
      {
        firstName: "Emily",
        lastName: "Davis",
        email: "emily.davis@example.com",
        password: "password123",
        phone: "9876543204",
        city: "Chennai",
        state: "Tamil Nadu",
        isEmailVerified: true
      },
      {
        firstName: "David",
        lastName: "Wilson",
        email: "david.wilson@example.com",
        password: "password123",
        phone: "9876543205",
        city: "Kolkata",
        state: "West Bengal",
        isEmailVerified: true
      }
    ];

    for (const customerData of customers) {
      const existing = await Customer.findOne({ email: customerData.email });
      if (existing) {
        console.log(`Customer ${customerData.email} already exists`);
      } else {
        await Customer.create(customerData);
        console.log(`Created customer: ${customerData.email}`);
      }
    }

    console.log("\n=== CUSTOMER LOGIN CREDENTIALS ===");
    console.log("Email: john.smith@example.com");
    console.log("Password: password123");
    console.log("=================================\n");

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

seedCustomers();
