const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const RecurringDeposit = require("../models/RecurringDeposit");
const BankAccount = require("../models/BankAccount");
const Transaction = require("../models/Transaction");
const Notification = require("../models/Notification");
const User = require("../models/User");

const router = express.Router();

// Check if customer exists for RD
router.get("/check-customer/:userId", auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ exists: false, message: "Customer not found" });
    }
    res.json({ exists: true, user: { firstName: user.firstName, lastName: user.lastName, email: user.email } });
  } catch (error) {
    res.status(500).json({ exists: false, message: error.message });
  }
});

// Create Recurring Deposit (Customer)
router.post("/create", auth, async (req, res) => {
  try {
    const { accountId, monthlyAmount, tenure } = req.body;

    const account = await BankAccount.findOne({ _id: accountId, user: req.userId });
    if (!account) return res.status(404).json({ message: "Account not found" });

    if (account.availableBalance < monthlyAmount) {
      return res.status(400).json({ message: "Insufficient balance for first deposit" });
    }

    const interestRate = 6.5;
    const maturityAmount = monthlyAmount * ((Math.pow(1 + interestRate / 100 / 12, tenure) - 1) / (interestRate / 100 / 12)) * (1 + interestRate / 100 / 12);
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + parseInt(tenure));

    const rd = await RecurringDeposit.create({
      user: req.userId,
      account: accountId,
      monthlyAmount,
      interestRate,
      tenureMonths: tenure,
      maturityAmount: Math.round(maturityAmount * 100) / 100,
      maturityDate,
      totalDeposited: monthlyAmount,
      currentDeposit: monthlyAmount,
      depositCount: 1
    });

    account.balance -= monthlyAmount;
    account.availableBalance -= monthlyAmount;
    await account.save();

    await Transaction.create({
      user: req.userId,
      account: accountId,
      type: "deposit",
      category: "Recurring Deposit",
      amount: monthlyAmount,
      description: `RD Created - ${tenure} months`,
      status: "completed",
      completedAt: Date.now()
    });

    await Notification.create({
      user: req.userId,
      type: "transaction",
      title: "Recurring Deposit Created",
      message: `Your RD of ₹${monthlyAmount}/month for ${tenure} months has been started`,
      priority: "medium"
    });

    res.status(201).json({ message: "Recurring Deposit created successfully", rd });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get My RDs (Customer)
router.get("/my-rds", auth, async (req, res) => {
  try {
    const rds = await RecurringDeposit.find({ user: req.userId }).populate("account");
    res.json(rds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Make Deposit to RD (Customer)
router.post("/:id/deposit", auth, async (req, res) => {
  try {
    const rd = await RecurringDeposit.findOne({ _id: req.params.id, user: req.userId });
    if (!rd) return res.status(404).json({ message: "RD not found" });

    if (rd.status !== "active") {
      return res.status(400).json({ message: "RD is not active" });
    }

    const account = await BankAccount.findOne({ _id: rd.account, user: req.userId });
    if (!account) return res.status(404).json({ message: "Account not found" });

    if (account.availableBalance < rd.monthlyAmount) {
      return res.status(400).json({ message: "Insufficient balance" });
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
    }

    await rd.save();

    await Transaction.create({
      user: req.userId,
      account: account._id,
      type: "deposit",
      category: "Recurring Deposit",
      amount: rd.monthlyAmount,
      description: `RD Deposit - ${rd.depositCount}/${rd.tenureMonths}`,
      status: "completed",
      completedAt: Date.now()
    });

    res.json({ message: "Deposit successful", rd });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get RD Details (Customer)
router.get("/:id", auth, async (req, res) => {
  try {
    const rd = await RecurringDeposit.findOne({ _id: req.params.id, user: req.userId }).populate("account");
    if (!rd) return res.status(404).json({ message: "RD not found" });
    res.json(rd);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get All RDs
router.get("/admin/all", auth, admin, async (req, res) => {
  try {
    const rds = await RecurringDeposit.find().populate("user").populate("account");
    const rdsWithValidUser = rds.map(rd => ({
      ...rd.toObject(),
      userExists: rd.user ? true : false,
      user: rd.user || null
    }));
    res.json(rdsWithValidUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
