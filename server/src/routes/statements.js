const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const Transaction = require("../models/Transaction");
const BankAccount = require("../models/BankAccount");
const Transfer = require("../models/Transfer");
const FixedDeposit = require("../models/FixedDeposit");
const RecurringDeposit = require("../models/RecurringDeposit");
const Loan = require("../models/Loan");

const router = express.Router();

// Get Account Statement (Customer)
router.get("/account/:accountId", auth, async (req, res) => {
  try {
    const { startDate, endDate, type, minAmount, maxAmount, limit = 100, page = 1 } = req.query;

    const account = await BankAccount.findOne({ _id: req.params.accountId, user: req.userId });
    if (!account) return res.status(404).json({ message: "Account not found" });

    const query = { account: req.params.accountId };
    
    if (type) query.type = type;
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
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Transaction.countDocuments(query);
    
    const summary = {
      totalCredits: transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
      totalDebits: transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0),
      transactionCount: transactions.length
    };

    res.json({
      account: {
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        bankName: account.bankName,
        balance: account.balance
      },
      transactions,
      summary,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Mini Statement (Last 10 transactions)
router.get("/mini/:accountId", auth, async (req, res) => {
  try {
    const account = await BankAccount.findOne({ _id: req.params.accountId, user: req.userId });
    if (!account) return res.status(404).json({ message: "Account not found" });

    const transactions = await Transaction.find({ account: req.params.accountId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ transactions, balance: account.balance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Consolidated Statement (All accounts)
router.get("/consolidated", auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const accounts = await BankAccount.find({ user: req.userId });
    const accountIds = accounts.map(a => a._id);

    const query = { account: { $in: accountIds } };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate("account", "accountNumber bankName accountType")
      .sort({ createdAt: -1 });

    const summary = {
      totalCredits: transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
      totalDebits: transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0),
      transactionCount: transactions.length
    };

    const byCategory = transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
      return acc;
    }, {});

    res.json({
      transactions,
      summary,
      byCategory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Financial Summary (Customer)
router.get("/summary", auth, async (req, res) => {
  try {
    const accounts = await BankAccount.find({ user: req.userId });
    const accountIds = accounts.map(a => a._id);

    const transactions = await Transaction.find({ account: { $in: accountIds } });

    const fds = await FixedDeposit.find({ user: req.userId });
    const rds = await RecurringDeposit.find({ user: req.userId });
    const loans = await Loan.find({ user: req.userId, status: "approved" });

    const totalAssets = accounts.reduce((sum, a) => sum + a.balance, 0) + 
      fds.reduce((sum, fd) => sum + fd.maturityAmount, 0) +
      rds.reduce((sum, rd) => sum + rd.maturityAmount, 0);

    const totalLiabilities = loans.reduce((sum, l) => sum + l.amount, 0);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyTransactions = transactions.filter(t => new Date(t.createdAt) >= thisMonth);

    res.json({
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
      accounts: accounts.length,
      fixedDeposits: fds.length,
      recurringDeposits: rds.length,
      activeLoans: loans.length,
      monthlyCredits: monthlyTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
      monthlyDebits: monthlyTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0),
      transactionCount: transactions.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get Bank-wide Statement Report
router.get("/admin/bank-statement", auth, admin, async (req, res) => {
  try {
    const { startDate, endDate, limit = 100, page = 1 } = req.query;
    
    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate("user", "firstName lastName email")
      .populate("account", "accountNumber bankName")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Transaction.countDocuments(query);

    const summary = {
      totalCredits: transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
      totalDebits: transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0),
      transactionCount: transactions.length,
      uniqueUsers: [...new Set(transactions.map(t => t.user?._id?.toString()))].length
    };

    res.json({ transactions, summary, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
