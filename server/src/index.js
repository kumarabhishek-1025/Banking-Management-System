const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ 
  origin: ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options("*", cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../../client/dist")));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// Load all models first to ensure they're registered
require("./models/User");
require("./models/Customer");
require("./models/BankAccount");
require("./models/Transaction");
require("./models/Loan");
require("./models/FixedDeposit");
require("./models/RecurringDeposit");
require("./models/CreditCard");
require("./models/ChequeBook");
require("./models/KYC");
require("./models/Notification");
require("./models/Complaint");
require("./models/Transfer");
require("./models/AuditLog");
require("./models/Admin");
require("./models/Employee");
require("./models/Branch");
require("./models/DepositScheme");
require("./models/LoanScheme");

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/accounts", require("./routes/accounts"));
app.use("/api/transfers", require("./routes/transfers"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/loans", require("./routes/loans"));
app.use("/api/loan-schemes", require("./routes/loanSchemes"));
app.use("/api/deposits", require("./routes/deposits"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/credit-cards", require("./routes/creditCards"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/cheque-books", require("./routes/chequeBooks"));
app.use("/api/recurring-deposits", require("./routes/recurringDeposits"));
app.use("/api/employees", require("./routes/employees"));
app.use("/api/kyc", require("./routes/kyc"));
app.use("/api/branches", require("./routes/branches"));
app.use("/api/statements", require("./routes/statements"));
app.use("/api/staff", require("./routes/staff"));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/complaints", require("./routes/complaints"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Horizon Bank API is running" });
});

// Serve the index.html for any other requests (for React Router)
app.get("*", (req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(404).json({ message: "API Route not found", path: req.originalUrl });
  }
  res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ message: "Internal server error", error: err.message });
});

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://kabhishek76673_db_user:coderarmy@cluster0.dsh1bkp.mongodb.net/horizon?appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB: horizon");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

module.exports = app;
