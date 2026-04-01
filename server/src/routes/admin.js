const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const Customer = require("../models/Customer");
const User = require("../models/User");
const BankAccount = require("../models/BankAccount");
const Transaction = require("../models/Transaction");
const Loan = require("../models/Loan");
const FixedDeposit = require("../models/FixedDeposit");
const RecurringDeposit = require("../models/RecurringDeposit");
const CreditCard = require("../models/CreditCard");
const ChequeBook = require("../models/ChequeBook");
const KYC = require("../models/KYC");
const Branch = require("../models/Branch");
const Notification = require("../models/Notification");
const Complaint = require("../models/Complaint");
const AuditLog = require("../models/AuditLog");
const Transfer = require("../models/Transfer");
const DepositScheme = require("../models/DepositScheme");
const Staff = require("../models/Employee");
const Employee = require("../models/Employee");

const router = express.Router();

// Create Customer (can create in User or Customer collection)
router.post("/users", auth, admin, async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, address, city, state, postalCode, collection } = req.body;
    
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "First name, last name, email and password are required" });
    }

    // Check both collections
    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingCustomer || existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Create in User or Customer collection based on 'collection' param
    let user;
    const targetCollection = collection === "customers" ? "Customer" : "User";
    
    if (targetCollection === "Customer") {
      user = await Customer.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password,
        phone,
        address,
        city,
        state,
        postalCode,
        role: "user"
      });
    } else {
      user = await User.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password,
        phone,
        address,
        city,
        state,
        postalCode,
        role: "customer"
      });
    }

    res.status(201).json({ message: "User created successfully", user, collection: targetCollection.toLowerCase() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== DASHBOARD ====================

// Get Comprehensive Dashboard Stats
router.get("/dashboard", auth, admin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    // Customer Stats - Include both User and Customer collections
    const totalCustomers = await Customer.countDocuments() + await User.countDocuments();
    const newCustomersTodayCust = await Customer.countDocuments({ createdAt: { $gte: today } });
    const newCustomersTodayUser = await User.countDocuments({ createdAt: { $gte: today } });
    const newCustomersToday = newCustomersTodayCust + newCustomersTodayUser;
    const newCustomersThisMonthCust = await Customer.countDocuments({ createdAt: { $gte: thisMonth } });
    const newCustomersThisMonthUser = await User.countDocuments({ createdAt: { $gte: thisMonth } });
    const newCustomersThisMonth = newCustomersThisMonthCust + newCustomersThisMonthUser;

    // Account Stats
    const totalAccounts = await BankAccount.countDocuments();
    const activeAccounts = await BankAccount.countDocuments({ status: "active" });
    const frozenAccounts = await BankAccount.countDocuments({ status: "frozen" });
    const pendingAccounts = await BankAccount.countDocuments({ status: "pending" });

    const accountBalances = await BankAccount.aggregate([
      { $group: { _id: null, total: { $sum: "$balance" }, available: { $sum: "$availableBalance" } } }
    ]);

    // Transaction Stats
    const todayTransactions = await Transaction.countDocuments({ createdAt: { $gte: today } });
    const thisMonthTransactions = await Transaction.countDocuments({ createdAt: { $gte: thisMonth } });
    
    const monthlyTransactions = await Transaction.find({ createdAt: { $gte: thisMonth } });
    const monthlyCredits = monthlyTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const monthlyDebits = monthlyTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Loan Stats
    const pendingLoans = await Loan.countDocuments({ status: "pending" });
    const approvedLoans = await Loan.countDocuments({ status: "approved" });
    const rejectedLoans = await Loan.countDocuments({ status: "rejected" });
    const loans = await Loan.find({ status: "approved" });
    const totalLoanDisbursed = loans.reduce((sum, l) => sum + l.amount, 0);

    // FD & RD Stats
    const activeFDs = await FixedDeposit.countDocuments({ status: "active" });
    const totalFDAmount = await FixedDeposit.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: null, total: { $sum: "$principalAmount" } } }
    ]);

    const activeRDs = await RecurringDeposit.countDocuments({ status: "active" });
    const totalRDAmount = await RecurringDeposit.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: null, total: { $sum: "$totalDeposited" } } }
    ]);

    // Credit Card Stats
    const activeCards = await CreditCard.countDocuments({ status: "active" });
    const blockedCards = await CreditCard.countDocuments({ status: "blocked" });
    const cardStats = await CreditCard.aggregate([
      { $group: { _id: null, totalLimit: { $sum: "$creditLimit" }, totalUsed: { $sum: "$outstandingAmount" } } }
    ]);

    // KYC Stats
    const pendingKYC = await KYC.countDocuments({ status: "pending" });
    const verifiedKYC = await KYC.countDocuments({ status: "verified" });
    const rejectedKYC = await KYC.countDocuments({ status: "rejected" });

    // Cheque Book Stats
    const pendingChequeBooks = await ChequeBook.countDocuments({ status: "pending" });
    const issuedChequeBooks = await ChequeBook.countDocuments({ status: "issued" });

    // Recent Activity
    const recentTransactions = await Transaction.find()
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 })
      .limit(10);

    const recentLoans = await Loan.find()
      .populate("user", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      users: {
        total: totalCustomers,
        newToday: newCustomersToday,
        newThisMonth: newCustomersThisMonth
      },
      accounts: {
        total: totalAccounts,
        active: activeAccounts,
        frozen: frozenAccounts,
        pending: pendingAccounts,
        totalBalance: accountBalances[0]?.total || 0,
        availableBalance: accountBalances[0]?.available || 0
      },
      transactions: {
        today: todayTransactions,
        thisMonth: thisMonthTransactions,
        monthlyCredits,
        monthlyDebits
      },
      loans: {
        pending: pendingLoans,
        approved: approvedLoans,
        rejected: rejectedLoans,
        totalDisbursed: totalLoanDisbursed
      },
      investments: {
        fds: { count: activeFDs, amount: totalFDAmount[0]?.total || 0 },
        rds: { count: activeRDs, amount: totalRDAmount[0]?.total || 0 }
      },
      creditCards: {
        active: activeCards,
        blocked: blockedCards,
        totalLimit: cardStats[0]?.totalLimit || 0,
        totalUsed: cardStats[0]?.totalUsed || 0
      },
      kyc: {
        pending: pendingKYC,
        verified: verifiedKYC,
        rejected: rejectedKYC
      },
      chequeBooks: {
        pending: pendingChequeBooks,
        issued: issuedChequeBooks
      },
      recentTransactions,
      recentLoans
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== USER MANAGEMENT ====================

// Get All Users (from both User and Customer collections)
router.get("/users", auth, admin, async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20, source } = req.query;
    
    let users = [];
    let total = 0;

    // If source is specified, check that specific collection
    if (source === "users" || !source) {
      const userQuery = {};
      if (search) {
        userQuery.$or = [
          { firstName: new RegExp(search, "i") },
          { lastName: new RegExp(search, "i") },
          { email: new RegExp(search, "i") },
          { phone: new RegExp(search, "i") }
        ];
      }
      if (status === "verified") userQuery.isEmailVerified = true;
      if (status === "unverified") userQuery.isEmailVerified = false;
      
      const userDocs = await User.find(userQuery)
        .select("-password")
        .sort({ createdAt: -1 });
      
      users = userDocs.map(u => ({
        ...u.toObject(),
        source: "users"
      }));
      total += await User.countDocuments(userQuery);
    }

    if (source === "customers" || !source) {
      const custQuery = {};
      if (search) {
        custQuery.$or = [
          { firstName: new RegExp(search, "i") },
          { lastName: new RegExp(search, "i") },
          { email: new RegExp(search, "i") },
          { phone: new RegExp(search, "i") }
        ];
      }
      if (status === "verified") custQuery.isVerified = true;
      if (status === "unverified") custQuery.isVerified = false;
      if (status === "active") custQuery.isActive = true;
      if (status === "inactive") custQuery.isActive = false;
      
      const custDocs = await Customer.find(custQuery)
        .select("-password")
        .sort({ createdAt: -1 });
      
      const custUsers = custDocs.map(c => ({
        ...c.toObject(),
        source: "customers"
      }));
      
      users = source === "customers" ? custUsers : [...users, ...custUsers];
      total += await Customer.countDocuments(custQuery);
    }

    // Apply pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const paginatedUsers = users.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.json({
      users: paginatedUsers,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Single Customer Details
router.get("/users/:id", auth, admin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try User collection first
    let user = await User.findById(id).select("-password");
    let source = "users";
    
    // If not found, try Customer collection
    if (!user) {
      user = await Customer.findById(id).select("-password");
      source = "customers";
    }
    
    // If still not found, try to find by email
    if (!user) {
      user = await User.findOne({ email: id }).select("-password");
      if (user) source = "users";
    }
    
    if (!user) {
      user = await Customer.findOne({ email: id }).select("-password");
      if (user) source = "customers";
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    // Get related data
    let accounts, loans, fds, cards, kyc;
    
    if (source === "users") {
      accounts = await BankAccount.find({ user: id });
      loans = await Loan.find({ user: id });
      fds = await FixedDeposit.find({ user: id });
      cards = await CreditCard.find({ user: id });
      kyc = await KYC.findOne({ user: id });
    } else {
      // For customers, use different field names
      accounts = await BankAccount.find({ customer: id });
      loans = await Loan.find({ customer: id });
      fds = await FixedDeposit.find({ customer: id });
      cards = await CreditCard.find({ customer: id });
      kyc = await KYC.findOne({ customer: id });
    }

    res.json({
      user,
      source,
      accounts,
      loans,
      fds,
      cards,
      kyc
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Customer (check both User and Customer collections)
router.patch("/users/:id", auth, admin, async (req, res) => {
  try {
    const { password, email, ...updates } = req.body;
    
    // Try User collection first
    let user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");
    let source = "users";
    
    // If not found, try Customer collection
    if (!user) {
      user = await Customer.findByIdAndUpdate(req.params.id, updates, { new: true }).select("-password");
      source = "customers";
    }
    
    // If not found by ID, try by email
    if (!user && email) {
      user = await User.findOneAndUpdate({ email: email.toLowerCase() }, updates, { new: true }).select("-password");
      if (user) source = "users";
      
      if (!user) {
        user = await Customer.findOneAndUpdate({ email: email.toLowerCase() }, updates, { new: true }).select("-password");
        if (user) source = "customers";
      }
    }
    
    if (!user) return res.status(404).json({ message: "User not found" });

    await Notification.create({
      user: req.params.id,
      type: "system",
      title: "Profile Updated",
      message: "Your profile has been updated by an administrator.",
      priority: "medium"
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Block/Unblock Customer (check both User and Customer collections)
router.post("/users/:id/toggle-status", auth, admin, async (req, res) => {
  try {
    // Try User collection first
    let user = await User.findById(req.params.id);
    let source = "users";
    
    if (!user) {
      user = await Customer.findById(req.params.id);
      source = "customers";
    }
    
    // Try by email if not found by ID
    if (!user) {
      user = await User.findOne({ email: req.params.id });
      if (user) source = "users";
      
      if (!user) {
        user = await Customer.findOne({ email: req.params.id });
        if (user) source = "customers";
      }
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    user.isActive = !user.isActive;
    await user.save();

    await Notification.create({
      user: user._id,
      type: "security",
      title: user.isActive ? "Account Activated" : "Account Blocked",
      message: user.isActive 
        ? "Your account has been activated by administrator."
        : "Your account has been blocked. Please contact support.",
      priority: "high"
    });

    res.json({ message: `User ${user.isActive ? "activated" : "blocked"}`, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Customer (check both collections)
router.delete("/users/:id", auth, admin, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Try User collection first
    let user = await User.findById(userId);
    let source = "users";
    
    if (!user) {
      user = await Customer.findById(userId);
      source = "customers";
    }
    
    // Try by email if not found by ID
    if (!user) {
      user = await User.findOne({ email: userId });
      if (user) source = "users";
      
      if (!user) {
        user = await Customer.findOne({ email: userId });
        if (user) source = "customers";
      }
    }
    
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update all related records with customer_deleted status (preserve history)
    const userField = source === "users" ? "user" : "customer";
    await Promise.all([
      Notification.updateMany({ [userField]: userId }, { $set: { [userField]: null, isSystem: true } }),
      Transaction.updateMany({ [userField]: userId }, { $set: { [userField]: null } }),
      Loan.updateMany({ [userField]: userId }, { $set: { status: "customer_deleted" } }),
      FixedDeposit.updateMany({ [userField]: userId }, { $set: { status: "customer_deleted" } }),
      RecurringDeposit.updateMany({ [userField]: userId }, { $set: { status: "customer_deleted" } }),
      CreditCard.updateMany({ [userField]: userId }, { $set: { status: "customer_deleted" } }),
      ChequeBook.updateMany({ [userField]: userId }, { $set: { status: "customer_deleted" } }),
      KYC.updateMany({ [userField]: userId }, { $set: { status: "customer_deleted" } }),
      Complaint.updateMany({ [userField]: userId }, { $set: { status: "customer_deleted" } }),
      Transfer.updateMany({ $or: [{ sender: userId }, { receiver: userId }] }, { $set: { status: "customer_deleted" } }),
    ]);

    const BankAccount = require("../models/BankAccount");
    await BankAccount.updateMany({ [userField]: userId }, { 
      $set: { status: "closed_by_admin", closureReason: "Customer deleted by admin", closedAt: new Date() } 
    });

    // Store user info before deletion
    const userInfo = { firstName: user.firstName, lastName: user.lastName, email: user.email };
    
    // Delete from the correct collection
    if (source === "users") {
      await User.findByIdAndDelete(userId);
    } else {
      await Customer.findByIdAndDelete(userId);
    }

    await AuditLog.create({
      employee: req.userId,
      action: "delete_customer",
      module: "admin",
      description: `Deleted customer: ${userInfo.firstName} ${userInfo.lastName} (${userInfo.email}) from ${source}`,
      ipAddress: req.ip
    });

    res.json({ message: "Customer deleted. All related records marked as customer_deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== ACCOUNT MANAGEMENT ====================

// Get All Accounts
router.get("/accounts", auth, admin, async (req, res) => {
  try {
    const { status, type, search, page = 1, limit = 20 } = req.query;
    let query = {};

    if (status) query.status = status;
    if (type) query.accountType = type;

    const accounts = await BankAccount.find(query)
      .populate("user", "firstName lastName email phone")
      .populate("customer", "firstName lastName email phone")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Fix user display - use customer if user is missing
    const fixedAccounts = accounts.map(acc => {
      if (!acc.user && acc.customer) {
        return { ...acc.toObject(), user: acc.customer };
      }
      // If both user and customer are missing, use a placeholder
      if (!acc.user && !acc.customer) {
        return { 
          ...acc.toObject(), 
          user: { firstName: "Unknown", lastName: "User", email: "N/A", _id: null }
        };
      }
      return acc;
    });

    const total = await BankAccount.countDocuments(query);
    const totalBalance = await BankAccount.aggregate([{ $group: { _id: null, total: { $sum: "$balance" } } }]);

    res.json({
      accounts: fixedAccounts,
      summary: { total, balance: totalBalance[0]?.total || 0 },
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Account Details
router.get("/accounts/:id", auth, admin, async (req, res) => {
  try {
    const account = await BankAccount.findById(req.params.id).populate("user", "firstName lastName email phone");
    if (!account) return res.status(404).json({ message: "Account not found" });

    const transactions = await Transaction.find({ account: req.params.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ account, transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve Account
router.post("/accounts/:id/approve", auth, admin, async (req, res) => {
  try {
    const account = await BankAccount.findById(req.params.id);
    if (!account) return res.status(404).json({ message: "Account not found" });

    account.status = "active";
    await account.save();

    await Notification.create({
      user: account.user,
      type: "transaction",
      title: "Account Approved",
      message: `Your ${account.accountType} account ending with ${account.accountNumber.slice(-4)} has been approved and is now active.`,
      priority: "high"
    });

    res.json({ message: "Account approved", account });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Freeze Account
router.post("/accounts/:id/freeze", auth, admin, async (req, res) => {
  try {
    const account = await BankAccount.findById(req.params.id);
    if (!account) return res.status(404).json({ message: "Account not found" });

    account.status = "frozen";
    await account.save();

    await Notification.create({
      user: account.user,
      type: "alert",
      title: "Account Frozen",
      message: `Your account ending with ${account.accountNumber.slice(-4)} has been frozen. Contact support.`,
      priority: "urgent"
    });

    res.json({ message: "Account frozen", account });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== TRANSACTION MANAGEMENT ====================

// Get All Transactions
router.get("/transactions", auth, admin, async (req, res) => {
  try {
    const { type, status, startDate, endDate, minAmount, maxAmount, page = 1, limit = 50 } = req.query;
    let query = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }

    const transactions = await Transaction.find(query)
      .populate("user", "firstName lastName email")
      .populate("customer", "firstName lastName email")
      .populate("account", "accountNumber accountType")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Fix: add accountNumber directly to each transaction
    const fixedTransactions = transactions.map(txn => {
      const obj = txn.toObject();
      if (txn.account) {
        obj.accountNumber = txn.account.accountNumber;
        obj.accountType = txn.account.accountType;
      }
      // Use customer if user is missing
      if (!obj.user && txn.customer) {
        obj.user = txn.customer;
      }
      return obj;
    });

    const total = await Transaction.countDocuments(query);
    const summary = {
      totalCredits: transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
      totalDebits: transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)
    };

    res.json({ transactions: fixedTransactions, summary, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel Transaction
router.post("/transactions/:id/cancel", auth, admin, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    if (transaction.status !== "pending") {
      return res.status(400).json({ message: "Can only cancel pending transactions" });
    }

    transaction.status = "cancelled";
    await transaction.save();

    // Reverse amount if already deducted
    if (transaction.type === "withdrawal" || transaction.type === "payment") {
      const account = await BankAccount.findById(transaction.account);
      account.balance += Math.abs(transaction.amount);
      account.availableBalance += Math.abs(transaction.amount);
      await account.save();
    }

    await Notification.create({
      user: transaction.user,
      type: "alert",
      title: "Transaction Cancelled",
      message: `Transaction of ₹${Math.abs(transaction.amount)} has been cancelled by administrator.`,
      priority: "high"
    });

    res.json({ message: "Transaction cancelled", transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== LOAN MANAGEMENT ====================

// Get All Loans
router.get("/loans", auth, admin, async (req, res) => {
  try {
    const { status, purpose, page = 1, limit = 20 } = req.query;
    let query = {};

    if (status) query.status = status;
    if (purpose) query.purpose = purpose;

    console.log("Admin loans query:", JSON.stringify(query));

    let loans = await Loan.find(query)
      .populate("user", "firstName lastName email phone")
      .populate("account", "accountNumber accountType")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    console.log("Found loans:", loans.length);

    // Fix user display - use customer if user is missing
    loans = loans.map(loan => {
      const obj = loan.toObject();
      if (!obj.user && obj.customer) {
        obj.user = obj.customer;
      }
      return obj;
    });

    const total = await Loan.countDocuments(query);
    const summary = {
      pending: await Loan.countDocuments({ status: "pending" }),
      approved: await Loan.countDocuments({ status: "approved" }),
      rejected: await Loan.countDocuments({ status: "rejected" })
    };

    res.json({ loans, summary, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    console.error("Admin loans error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Approve/Reject Loan
router.post("/loans/:id/review", auth, admin, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const loan = await Loan.findById(req.params.id).populate("user");

    if (!loan) return res.status(404).json({ message: "Loan not found" });
    if (loan.status !== "pending") return res.status(400).json({ message: "Loan already processed" });

    loan.status = status;

    if (status === "approved") {
      const account = await BankAccount.findById(loan.account);
      account.balance += loan.amount;
      account.availableBalance += loan.amount;
      await account.save();

      await Transaction.create({
        user: loan.user._id,
        account: loan.account,
        type: "deposit",
        category: "Loan Disbursal",
        amount: loan.amount,
        description: `Loan approved: ${loan.purpose}`,
        status: "completed",
        reference: `LOAN_${loan._id}`,
        completedAt: new Date()
      });
    }

    await loan.save();

    await Notification.create({
      user: loan.user._id,
      type: status === "approved" ? "transaction" : "alert",
      title: status === "approved" ? "Loan Approved" : "Loan Rejected",
      message: status === "approved"
        ? `Your ${loan.purpose} loan of ₹${loan.amount} has been approved and disbursed.`
        : `Your loan application has been rejected. Reason: ${rejectionReason || "Not specified"}`,
      priority: "high"
    });

    res.json({ message: `Loan ${status}`, loan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== KYC MANAGEMENT ====================

// Get All KYC Applications
router.get("/kyc", auth, admin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};

    if (status) query.status = status;

    const kycRecords = await KYC.find(query)
      .populate("user", "firstName lastName email phone")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await KYC.countDocuments(query);

    res.json({ kycRecords, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Review KYC
router.post("/kyc/:id/review", auth, admin, async (req, res) => {
  try {
    const { status, rejectionReason, riskCategory } = req.body;
    const kyc = await KYC.findById(req.params.id).populate("user");

    if (!kyc) return res.status(404).json({ message: "KYC not found" });

    kyc.status = status;
    kyc.isVerified = status === "verified";
    kyc.verifiedBy = req.userId;
    kyc.verifiedAt = new Date();
    kyc.riskCategory = riskCategory || kyc.riskCategory;

    if (status === "rejected") {
      kyc.rejectionReason = rejectionReason;
    }

    await kyc.save();

    await Notification.create({
      user: kyc.user._id,
      type: "system",
      title: status === "verified" ? "KYC Verified" : "KYC Rejected",
      message: status === "verified"
        ? "Your KYC has been verified successfully. You can now access all features."
        : `Your KYC has been rejected. Reason: ${rejectionReason || "Not specified"}`,
      priority: "high"
    });

    res.json({ message: `KYC ${status}`, kyc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== CREDIT CARD MANAGEMENT ====================

// Get All Credit Cards
router.get("/credit-cards", auth, admin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};
    if (status) query.status = status;

    const cards = await CreditCard.find(query)
      .populate("user", "firstName lastName email")
      .populate("account", "accountNumber")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await CreditCard.countDocuments(query);

    res.json({ cards, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Credit Limit
router.post("/credit-cards/:id/limit", auth, admin, async (req, res) => {
  try {
    const { creditLimit } = req.body;
    const card = await CreditCard.findById(req.params.id);

    if (!card) return res.status(404).json({ message: "Card not found" });

    const oldLimit = card.creditLimit;
    const difference = creditLimit - oldLimit;

    card.creditLimit = creditLimit;
    card.availableCredit += difference;
    await card.save();

    await Notification.create({
      user: card.user,
      type: "transaction",
      title: "Credit Limit Updated",
      message: `Your credit limit has been changed from ₹${oldLimit} to ₹${creditLimit}.`,
      priority: "medium"
    });

    res.json({ message: "Credit limit updated", card });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Block/Unblock Card
router.post("/credit-cards/:id/toggle", auth, admin, async (req, res) => {
  try {
    const card = await CreditCard.findById(req.params.id);
    if (!card) return res.status(404).json({ message: "Card not found" });

    card.status = card.status === "active" ? "blocked" : "active";
    await card.save();

    await Notification.create({
      user: card.user,
      type: "security",
      title: card.status === "active" ? "Card Unblocked" : "Card Blocked",
      message: `Your credit card ending with ${card.cardNumber.slice(-4)} has been ${card.status}.`,
      priority: "high"
    });

    res.json({ message: `Card ${card.status}`, card });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== CHEQUE BOOK MANAGEMENT ====================

// Get All Cheque Books
router.get("/cheque-books", auth, admin, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};
    if (status) query.status = status;

    const chequeBooks = await ChequeBook.find(query)
      .populate("user", "firstName lastName email")
      .populate("account", "accountNumber")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await ChequeBook.countDocuments(query);

    res.json({ chequeBooks, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Issue Cheque Book
router.post("/cheque-books/:id/issue", auth, admin, async (req, res) => {
  try {
    const chequeBook = await ChequeBook.findById(req.params.id).populate("user");
    if (!chequeBook) return res.status(404).json({ message: "Cheque book not found" });

    if (chequeBook.status !== "pending") {
      return res.status(400).json({ message: "Cheque book already processed" });
    }

    chequeBook.status = "issued";
    chequeBook.dispatchedAt = new Date();
    await chequeBook.save();

    await Notification.create({
      user: chequeBook.user._id,
      type: "transaction",
      title: "Cheque Book Issued",
      message: `Your cheque book (${chequeBook.leafCount} leaves) has been issued. Cheque numbers: ${chequeBook.startChequeNumber} - ${chequeBook.endChequeNumber}`,
      priority: "high"
    });

    res.json({ message: "Cheque book issued", chequeBook });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== BRANCH MANAGEMENT ====================

// Get All Branches
router.get("/branches", auth, admin, async (req, res) => {
  try {
    const branches = await Branch.find().populate("branchManager", "firstName lastName").sort({ createdAt: -1 });
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create Branch
router.post("/branches", auth, admin, async (req, res) => {
  try {
    const branch = await Branch.create(req.body);
    res.status(201).json({ message: "Branch created", branch });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Branch
router.patch("/branches/:id", auth, admin, async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!branch) return res.status(404).json({ message: "Branch not found" });
    res.json({ message: "Branch updated", branch });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== REPORTS & ANALYTICS ====================

// Financial Report
router.get("/reports/financial", auth, admin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    const transactions = await Transaction.find({
      createdAt: { $gte: start, $lte: end }
    });

    const deposits = await FixedDeposit.find({ createdAt: { $gte: start, $lte: end } });
    const loans = await Loan.find({ createdAt: { $gte: start, $lte: end }, status: "approved" });

    const totalDeposits = await BankAccount.aggregate([{ $group: { _id: null, total: { $sum: "$balance" } } }]);

    res.json({
      period: { start, end },
      transactions: {
        count: transactions.length,
        credits: transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
        debits: transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)
      },
      newFDs: { count: deposits.length, amount: deposits.reduce((sum, d) => sum + d.principalAmount, 0) },
      newLoans: { count: loans.length, amount: loans.reduce((sum, l) => sum + l.amount, 0) },
      totalDeposits: totalDeposits[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Customer Activity Report
router.get("/reports/users", auth, admin, async (req, res) => {
  try {
    const { period = "30" } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const usersByDay = await Customer.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const verifiedCustomers = await Customer.countDocuments({ isVerified: true });
    const unverifiedCustomers = await Customer.countDocuments({ isVerified: false });

    res.json({
      period,
      usersByDay,
      summary: { verified: verifiedCustomers, unverified: unverifiedCustomers, total: verifiedCustomers + unverifiedCustomers }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== NOTIFICATIONS ====================

// Send Notification to Customer
router.post("/notify/:userId", auth, admin, async (req, res) => {
  try {
    const { title, message, type, priority } = req.body;
    
    const notification = await Notification.create({
      user: req.params.userId,
      type: type || "system",
      title,
      message,
      priority: priority || "medium",
      sentAt: new Date()
    });

    res.status(201).json({ message: "Notification sent", notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Broadcast to All Customers
router.post("/broadcast", auth, admin, async (req, res) => {
  try {
    const { title, message, type, priority } = req.body;
    const users = await Customer.find();

    const notifications = await Notification.insertMany(
      users.map(user => ({
        user: user._id,
        type: type || "system",
        title,
        message,
        priority: priority || "medium",
        sentAt: new Date()
      }))
    );

    res.status(201).json({ message: "Broadcast sent", count: notifications.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== DEPOSIT SCHEMES ====================

router.get("/deposit-schemes", auth, admin, async (req, res) => {
  try {
    const { type, isActive } = req.query;
    let query = {};
    if (type) query.type = type;
    if (isActive !== undefined) query.isActive = isActive === "true";

    const schemes = await DepositScheme.find(query).sort({ type: 1, interestRate: -1 });
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/deposit-schemes", auth, admin, async (req, res) => {
  try {
    const scheme = await DepositScheme.create({
      ...req.body,
      createdBy: req.userId
    });

    await AuditLog.create({
      employee: req.userId,
      action: "create_deposit_scheme",
      module: "fd",
      description: `Created deposit scheme: ${scheme.name} (${scheme.type})`,
      newData: scheme.toObject(),
      ipAddress: req.ip
    });

    res.status(201).json({ message: "Scheme created successfully", scheme });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/deposit-schemes/:id", auth, admin, async (req, res) => {
  try {
    const scheme = await DepositScheme.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!scheme) return res.status(404).json({ message: "Scheme not found" });

    await AuditLog.create({
      employee: req.userId,
      action: "update_deposit_scheme",
      module: "fd",
      description: `Updated deposit scheme: ${scheme.name}`,
      newData: scheme.toObject(),
      ipAddress: req.ip
    });

    res.json({ message: "Scheme updated", scheme });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/deposit-schemes/:id", auth, admin, async (req, res) => {
  try {
    const scheme = await DepositScheme.findByIdAndDelete(req.params.id);
    if (!scheme) return res.status(404).json({ message: "Scheme not found" });

    await AuditLog.create({
      employee: req.userId,
      action: "delete_deposit_scheme",
      module: "fd",
      description: `Deleted deposit scheme: ${scheme.name}`,
      ipAddress: req.ip
    });

    res.json({ message: "Scheme deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== STAFF MANAGEMENT ====================

// Get all staff (excluding admins - they are in /admins endpoint)
router.get("/staff", auth, admin, async (req, res) => {
  try {
    const { role, isActive, excludeAdmins } = req.query;
    const query = {};
    
    // Exclude admins by default - they should be managed separately
    if (excludeAdmins !== "false") {
      query.role = { $ne: "admin" };
    }
    
    if (role && role !== "all") query.role = role;
    if (isActive !== undefined) query.isActive = isActive === "true";

    const employees = await Employee.find(query).sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all admins only
router.get("/admins", auth, admin, async (req, res) => {
  try {
    const { isActive } = req.query;
    const query = { role: "admin" };
    if (isActive !== undefined) query.isActive = isActive === "true";

    const admins = await Employee.find(query).sort({ createdAt: -1 });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create staff member
router.post("/staff", auth, admin, async (req, res) => {
  try {
    const { role } = req.body;
    if (role === "admin") {
      return res.status(400).json({ message: "Use /admins endpoint to create admin" });
    }
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create admin
router.post("/admins", auth, admin, async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if admin already exists
    const existing = await Employee.findOne({ email: email.toLowerCase(), role: "admin" });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists with this email" });
    }
    
    const employee = new Employee(req.body);
    employee.role = "admin";
    await employee.save();
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/staff/:id", auth, admin, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/staff/:id", auth, admin, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    
    if (employee.role === "admin") {
      return res.status(400).json({ message: "Cannot delete admin - use /admins endpoint" });
    }
    
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: "Employee deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== NOTIFICATIONS ====================

router.get("/notifications", auth, admin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const notifications = await Notification.find()
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Notification.countDocuments();
    res.json({ notifications, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== COMPLAINTS ====================

router.get("/complaints", auth, admin, async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    const query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;

    const complaints = await Complaint.find(query)
      .populate("user", "firstName lastName email phone")
      .populate("responses.respondedBy", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Complaint.countDocuments(query);
    
    res.json({ 
      complaints, 
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/complaints/stats", auth, admin, async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: "pending" });
    const inProgress = await Complaint.countDocuments({ status: "in_progress" });
    const resolved = await Complaint.countDocuments({ status: "resolved" });
    const rejected = await Complaint.countDocuments({ status: "rejected" });

    const byCategory = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    res.json({
      total,
      pending,
      inProgress,
      resolved,
      rejected,
      byCategory: byCategory.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/complaints/:id/respond", auth, admin, async (req, res) => {
  try {
    const { message, status } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.responses.push({
      from: "staff",
      message,
      respondedBy: req.userId,
      respondedAt: new Date()
    });

    if (status) {
      complaint.status = status;
      if (status === "resolved") {
        complaint.resolvedAt = new Date();
      }
    } else if (complaint.status === "pending") {
      complaint.status = "in_progress";
    }

    await complaint.save();

    await Notification.create({
      user: complaint.user,
      type: "support",
      title: "Complaint Updated",
      message: `Your complaint "${complaint.subject}" has been updated.`,
      priority: "medium"
    });

    res.json({ message: "Response added", complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/complaints/:id/resolve", auth, admin, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = "resolved";
    complaint.resolvedAt = new Date();
    await complaint.save();

    await Notification.create({
      user: complaint.user,
      type: "support",
      title: "Complaint Resolved",
      message: `Your complaint "${complaint.subject}" has been resolved.`,
      priority: "medium"
    });

    res.json({ message: "Complaint resolved", complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/complaints/:id/reject", auth, admin, async (req, res) => {
  try {
    const { reason } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = "rejected";
    complaint.rejectionReason = reason;
    await complaint.save();

    await Notification.create({
      user: complaint.user,
      type: "support",
      title: "Complaint Rejected",
      message: `Your complaint "${complaint.subject}" has been rejected. Reason: ${reason}`,
      priority: "medium"
    });

    res.json({ message: "Complaint rejected", complaint });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== AUDIT LOGS ====================

router.get("/audit-logs", auth, admin, async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, action } = req.query;
    const query = {};
    if (userId) query.user = userId;
    if (action) query.action = action;

    const logs = await AuditLog.find(query)
      .populate("user", "firstName lastName email")
      .populate("employee", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await AuditLog.countDocuments(query);
    res.json({ logs, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
