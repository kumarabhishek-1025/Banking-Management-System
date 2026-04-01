const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const User = require("../models/User");
const BankAccount = require("../models/BankAccount");
const Transaction = require("../models/Transaction");
const Loan = require("../models/Loan");
const FixedDeposit = require("../models/FixedDeposit");
const RecurringDeposit = require("../models/RecurringDeposit");
const CreditCard = require("../models/CreditCard");
const KYC = require("../models/KYC");

const router = express.Router();

// Get Dashboard Stats (Admin)
router.get("/dashboard", auth, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalAccounts = await BankAccount.countDocuments();
    const activeAccounts = await BankAccount.countDocuments({ status: "active" });
    
    const accountBalances = await BankAccount.aggregate([
      { $group: { _id: null, total: { $sum: "$balance" } } }
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTransactions = await Transaction.countDocuments({
      createdAt: { $gte: today }
    });

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const monthlyTransactions = await Transaction.find({
      createdAt: { $gte: thisMonth }
    });

    const pendingLoans = await Loan.countDocuments({ status: "pending" });
    const approvedLoans = await Loan.countDocuments({ status: "approved" });
    
    const loans = await Loan.find({ status: "approved" });
    const totalLoanDisbursed = loans.reduce((sum, l) => sum + l.amount, 0);

    const fds = await FixedDeposit.find({ status: "active" });
    const totalFD = fds.reduce((sum, fd) => sum + fd.principalAmount, 0);

    const rds = await RecurringDeposit.find({ status: "active" });
    const totalRD = rds.reduce((sum, rd) => sum + rd.totalDeposited, 0);

    const pendingKYC = await KYC.countDocuments({ status: "pending" });
    const verifiedKYC = await KYC.countDocuments({ status: "verified" });

    const recentTransactions = await Transaction.find()
      .populate("user", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      users: {
        total: totalUsers,
        active: totalUsers
      },
      accounts: {
        total: totalAccounts,
        active: activeAccounts,
        totalBalance: accountBalances[0]?.total || 0
      },
      transactions: {
        today: todayTransactions,
        thisMonth: monthlyTransactions.length,
        monthlyCredits: monthlyTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
        monthlyDebits: monthlyTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)
      },
      loans: {
        pending: pendingLoans,
        approved: approvedLoans,
        totalDisbursed: totalLoanDisbursed
      },
      investments: {
        totalFD: totalFD,
        totalRD: totalRD,
        fdCount: fds.length,
        rdCount: rds.length
      },
      kyc: {
        pending: pendingKYC,
        verified: verifiedKYC
      },
      recentTransactions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get User Analytics (Admin)
router.get("/users", auth, admin, async (req, res) => {
  try {
    const { period = "30" } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const usersByDay = await User.aggregate([
      { 
        $match: { 
          role: "user",
          createdAt: { $gte: startDate }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const kycStats = await KYC.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    res.json({
      usersByDay,
      kycStats: kycStats.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {})
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Transaction Analytics (Admin)
router.get("/transactions", auth, admin, async (req, res) => {
  try {
    const { period = "30" } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const transactionsByDay = await Transaction.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          credits: { $sum: { $cond: [{ $gt: ["$amount", 0] }, "$amount", 0] } },
          debits: { $sum: { $cond: [{ $lt: ["$amount", 0] }, { $abs: "$amount" }, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const byCategory = await Transaction.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          total: { $sum: { $abs: "$amount" } }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);

    const byType = await Transaction.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          total: { $sum: { $abs: "$amount" } }
        }
      }
    ]);

    res.json({
      transactionsByDay,
      byCategory,
      byType
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Financial Analytics (Admin)
router.get("/financial", auth, admin, async (req, res) => {
  try {
    const totalBalance = await BankAccount.aggregate([
      { $group: { _id: null, total: { $sum: "$balance" } } }
    ]);

    const loansDisbursed = await Loan.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalFD = await FixedDeposit.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: null, total: { $sum: "$principalAmount" } } }
    ]);

    const totalRD = await RecurringDeposit.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: null, total: { $sum: "$totalDeposited" } } }
    ]);

    const totalCardsLimit = await CreditCard.aggregate([
      { $group: { _id: null, totalLimit: { $sum: "$creditLimit" }, totalUsed: { $sum: "$outstandingAmount" } } }
    ]);

    res.json({
      totalDeposits: totalBalance[0]?.total || 0,
      loansDisbursed: loansDisbursed[0]?.total || 0,
      totalFixedDeposits: totalFD[0]?.total || 0,
      totalRecurringDeposits: totalRD[0]?.total || 0,
      creditCard: {
        totalLimit: totalCardsLimit[0]?.totalLimit || 0,
        totalUsed: totalCardsLimit[0]?.totalUsed || 0,
        available: (totalCardsLimit[0]?.totalLimit || 0) - (totalCardsLimit[0]?.totalUsed || 0)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
