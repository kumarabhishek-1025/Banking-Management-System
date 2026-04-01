const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const FixedDeposit = require("../models/FixedDeposit");
const RecurringDeposit = require("../models/RecurringDeposit");
const BankAccount = require("../models/BankAccount");
const Transaction = require("../models/Transaction");
const Notification = require("../models/Notification");
const DepositScheme = require("../models/DepositScheme");
const User = require("../models/User");

const router = express.Router();

// Get all deposit schemes (public)
router.get("/schemes", async (req, res) => {
  try {
    const { type } = req.query;
    let query = { isActive: true };
    if (type) query.type = type;
    
    const schemes = await DepositScheme.find(query).sort({ type: 1, interestRate: -1 });
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Calculate FD maturity amount
router.post("/calculate-fd", auth, async (req, res) => {
  try {
    const { schemeId, amount } = req.body;
    
    const scheme = await DepositScheme.findById(schemeId);
    if (!scheme || scheme.type !== "fixed") {
      return res.status(404).json({ message: "Fixed Deposit scheme not found" });
    }
    
    if (amount < scheme.minAmount || (scheme.maxAmount && amount > scheme.maxAmount)) {
      return res.status(400).json({ message: `Amount must be between ₹${scheme.minAmount} and ₹${scheme.maxAmount || 'no limit'}` });
    }
    
    let rate = scheme.interestRate;
    if (scheme.specialRateMinAmount && amount >= scheme.specialRateMinAmount) {
      rate = scheme.specialRate || rate;
    }
    
    const monthlyRate = rate / 12 / 100;
    const months = scheme.minTenureMonths;
    const maturityAmount = amount * Math.pow(1 + monthlyRate, months);
    
    res.json({
      interestRate: rate,
      maturityAmount: Math.round(maturityAmount * 100) / 100,
      totalInterest: Math.round((maturityAmount - amount) * 100) / 100,
      tenureMonths: months
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Calculate RD maturity amount
router.post("/calculate-rd", auth, async (req, res) => {
  try {
    const { schemeId, monthlyAmount } = req.body;
    
    const scheme = await DepositScheme.findById(schemeId);
    if (!scheme || scheme.type !== "recurring") {
      return res.status(404).json({ message: "Recurring Deposit scheme not found" });
    }
    
    if (monthlyAmount < scheme.minAmount || (scheme.maxAmount && monthlyAmount > scheme.maxAmount)) {
      return res.status(400).json({ message: `Monthly amount must be between ₹${scheme.minAmount} and ₹${scheme.maxAmount || 'no limit'}` });
    }
    
    let rate = scheme.interestRate;
    if (scheme.specialRateMinAmount && monthlyAmount >= scheme.specialRateMinAmount) {
      rate = scheme.specialRate || rate;
    }
    
    const months = scheme.minTenureMonths;
    const monthlyRate = rate / 12 / 100;
    const maturityAmount = monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    
    res.json({
      interestRate: rate,
      maturityAmount: Math.round(maturityAmount * 100) / 100,
      totalInterest: Math.round((maturityAmount - (monthlyAmount * months)) * 100) / 100,
      totalDeposited: monthlyAmount * months,
      tenureMonths: months
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create Fixed Deposit (Customer) - Pending approval
router.post("/create-fd", auth, async (req, res) => {
  try {
    const { schemeId, accountId, amount } = req.body;

    const account = await BankAccount.findOne({ _id: accountId, user: req.userId, status: "active" });
    if (!account) return res.status(404).json({ message: "Account not found or not active" });
    if (account.availableBalance < amount) return res.status(400).json({ message: "Insufficient balance" });

    const scheme = await DepositScheme.findById(schemeId);
    if (!scheme || scheme.type !== "fixed") {
      return res.status(404).json({ message: "Invalid FD scheme" });
    }
    
    if (amount < scheme.minAmount || (scheme.maxAmount && amount > scheme.maxAmount)) {
      return res.status(400).json({ message: `Amount must be between ₹${scheme.minAmount} and ₹${scheme.maxAmount || 'no limit'}` });
    }

    let interestRate = scheme.interestRate;
    if (scheme.specialRateMinAmount && amount >= scheme.specialRateMinAmount) {
      interestRate = scheme.specialRate || interestRate;
    }
    
    const maturityAmount = amount * Math.pow(1 + (interestRate / 12 / 100), scheme.minTenureMonths);
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + scheme.minTenureMonths);

    const fd = await FixedDeposit.create({
      user: req.userId,
      account: accountId,
      schemeName: scheme.name,
      amount,
      interestRate,
      tenure: scheme.minTenureMonths,
      maturityAmount: Math.round(maturityAmount * 100) / 100,
      maturityDate,
      status: "pending"
    });

    await Notification.create({
      user: req.userId,
      type: "transaction",
      title: "Fixed Deposit Submitted",
      message: `Your FD request of ₹${amount} for ${scheme.minTenureMonths} months has been submitted and is pending approval.`,
      priority: "medium"
    });

    res.status(201).json({ message: "Fixed Deposit request submitted. Waiting for approval.", fd });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create Recurring Deposit (Customer) - Pending approval
router.post("/create-rd", auth, async (req, res) => {
  try {
    const { schemeId, accountId, monthlyAmount } = req.body;

    const account = await BankAccount.findOne({ _id: accountId, user: req.userId, status: "active" });
    if (!account) return res.status(404).json({ message: "Account not found or not active" });
    if (account.availableBalance < monthlyAmount) return res.status(400).json({ message: "Insufficient balance for first deposit" });

    const scheme = await DepositScheme.findById(schemeId);
    if (!scheme || scheme.type !== "recurring") {
      return res.status(404).json({ message: "Invalid RD scheme" });
    }
    
    if (monthlyAmount < scheme.minAmount || (scheme.maxAmount && monthlyAmount > scheme.maxAmount)) {
      return res.status(400).json({ message: `Monthly amount must be between ₹${scheme.minAmount} and ₹${scheme.maxAmount || 'no limit'}` });
    }

    let interestRate = scheme.interestRate;
    if (scheme.specialRateMinAmount && monthlyAmount >= scheme.specialRateMinAmount) {
      interestRate = scheme.specialRate || interestRate;
    }
    
    const months = scheme.minTenureMonths;
    const monthlyRate = interestRate / 12 / 100;
    const maturityAmount = monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + months);

    const rd = await RecurringDeposit.create({
      user: req.userId,
      account: accountId,
      schemeName: scheme.name,
      monthlyAmount,
      interestRate,
      tenureMonths: months,
      maturityAmount: Math.round(maturityAmount * 100) / 100,
      maturityDate,
      totalDeposited: 0,
      currentDeposit: 0,
      depositCount: 0,
      nextDepositDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      status: "pending"
    });

    await Notification.create({
      user: req.userId,
      type: "transaction",
      title: "Recurring Deposit Submitted",
      message: `Your RD request of ₹${monthlyAmount}/month for ${months} months has been submitted and is pending approval.`,
      priority: "medium"
    });

    res.status(201).json({ message: "Recurring Deposit request submitted. Waiting for approval.", rd });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Auto-process RD deposits (should be called by cron job)
router.post("/process-rd", auth, admin, async (req, res) => {
  try {
    const now = new Date();
    const rds = await RecurringDeposit.find({ 
      status: "active",
      nextDepositDate: { $lte: now }
    }).populate("user");
    
    let processed = 0;
    for (const rd of rds) {
      const account = await BankAccount.findById(rd.account);
      if (!account || account.availableBalance < rd.monthlyAmount) {
        continue;
      }
      
      account.balance -= rd.monthlyAmount;
      account.availableBalance -= rd.monthlyAmount;
      await account.save();
      
      rd.totalDeposited += rd.monthlyAmount;
      rd.currentDeposit += rd.monthlyAmount;
      rd.depositCount += 1;
      
      const nextDate = new Date(rd.nextDepositDate);
      nextDate.setMonth(nextDate.getMonth() + 1);
      rd.nextDepositDate = nextDate;
      
      if (rd.depositCount >= rd.tenureMonths) {
        rd.status = "completed";
        account.balance += rd.maturityAmount;
        account.availableBalance += rd.maturityAmount;
        await account.save();
        
        await Notification.create({
          user: rd.user._id,
          type: "transaction",
          title: "Recurring Deposit Completed!",
          message: `Your RD of ₹${rd.monthlyAmount}/month has completed. ₹${rd.maturityAmount} has been credited to your account.`,
          priority: "high"
        });
      }
      
      await rd.save();
      processed++;
    }
    
    res.json({ message: `Processed ${processed} RD deposits` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get my FDs (Customer)
router.get("/my-fds", auth, async (req, res) => {
  try {
    const fds = await FixedDeposit.find({ user: req.userId }).populate("account");
    res.json(fds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get my RDs (Customer)
router.get("/my-rds", auth, async (req, res) => {
  try {
    const rds = await RecurringDeposit.find({ user: req.userId }).populate("account");
    res.json(rds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get all FDs
router.get("/all-fds", auth, admin, async (req, res) => {
  try {
    const fds = await FixedDeposit.find().populate("user").populate("account");
    const fdsWithUser = fds.map(fd => ({
      ...fd.toObject(),
      userExists: fd.user ? true : false,
      user: fd.user || null
    }));
    res.json(fdsWithUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get all RDs
router.get("/all-rds", auth, admin, async (req, res) => {
  try {
    const rds = await RecurringDeposit.find().populate("user").populate("account");
    const rdsWithUser = rds.map(rd => ({
      ...rd.toObject(),
      userExists: rd.user ? true : false,
      user: rd.user || null
    }));
    res.json(rdsWithUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
