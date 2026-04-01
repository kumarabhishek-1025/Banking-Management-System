const express = require("express");
const { v4: uuidv4 } = require("uuid");
const BankAccount = require("../models/BankAccount");
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all accounts for user
router.get("/", auth, async (req, res) => {
  try {
    const accounts = await BankAccount.find({ user: req.userId }).sort({ createdAt: -1 });
    
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalAvailable = accounts.reduce((sum, acc) => sum + acc.availableBalance, 0);

    res.json({
      accounts,
      summary: {
        totalBalance,
        totalAvailable,
        accountCount: accounts.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create new account
router.post("/create", auth, async (req, res) => {
  try {
    const { accountType, bankName, branchName, initialDeposit } = req.body;

    if (!bankName) {
      return res.status(400).json({ message: "Bank name is required" });
    }

    const accountNumber = "4" + Math.floor(100000000 + Math.random() * 900000000).toString();
    const routingNumber = Math.floor(100000000 + Math.random() * 900000000).toString();
    const ifscCode = "HZB" + Math.floor(1000 + Math.random() * 9000).toString();

    const account = new BankAccount({
      user: req.userId,
      accountNumber,
      routingNumber,
      accountType: accountType || "checking",
      bankName,
      branchName,
      ifscCode,
      balance: initialDeposit || 0,
      availableBalance: initialDeposit || 0
    });

    await account.save();

    // If initial deposit, create transaction
    if (initialDeposit && initialDeposit > 0) {
      await Transaction.create({
        user: req.userId,
        customer: req.userId,
        account: account._id,
        type: "deposit",
        category: "Account Opening",
        amount: initialDeposit,
        description: "Initial deposit for new account",
        senderName: "Self",
        status: "completed",
        paymentMethod: "cash",
        completedAt: new Date()
      });
    }

    res.status(201).json({
      message: "Account created successfully",
      account
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get single account
router.get("/:accountId", auth, async (req, res) => {
  try {
    const account = await BankAccount.findOne({ 
      _id: req.params.accountId, 
      user: req.userId 
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    const transactions = await Transaction.find({ 
      account: account._id 
    }).sort({ createdAt: -1 }).limit(50);

    res.json({ account, transactions });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Deposit money
router.post("/:accountId/deposit", auth, async (req, res) => {
  try {
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const account = await BankAccount.findOne({ 
      _id: req.params.accountId, 
      user: req.userId 
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    account.balance += amount;
    account.availableBalance += amount;
    await account.save();

    const transaction = await Transaction.create({
      user: req.userId,
      customer: req.userId,
      account: account._id,
      type: "deposit",
      category: "Deposit",
      amount: amount,
      description: description || "Deposit",
      senderName: "Self",
      status: "completed",
      paymentMethod: "cash",
      completedAt: new Date()
    });

    res.json({ 
      message: "Deposit successful", 
      account,
      transaction
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Withdraw money
router.post("/:accountId/withdraw", auth, async (req, res) => {
  try {
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const account = await BankAccount.findOne({ 
      _id: req.params.accountId, 
      user: req.userId 
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Check if account is active (approved by admin)
    if (account.status !== "active") {
      return res.status(403).json({ message: "Your account is not approved yet. Please wait for admin approval." });
    }

    if (account.availableBalance < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    account.balance -= amount;
    account.availableBalance -= amount;
    await account.save();

    const transaction = await Transaction.create({
      user: req.userId,
      customer: req.userId,
      account: account._id,
      type: "withdrawal",
      category: "Withdrawal",
      amount: -amount,
      description: description || "Withdrawal",
      senderName: "Self",
      status: "completed",
      paymentMethod: "cash",
      completedAt: new Date()
    });

    res.json({ 
      message: "Withdrawal successful", 
      account,
      transaction
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Close account by customer (withdraw early)
router.post("/:accountId/close", auth, async (req, res) => {
  try {
    const account = await BankAccount.findOne({ 
      _id: req.params.accountId, 
      user: req.userId 
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (account.status !== "active") {
      return res.status(400).json({ message: "Only active accounts can be closed" });
    }

    const balance = account.balance;

    // Transfer balance to another account if provided
    const { transferToAccountId } = req.body;
    if (transferToAccountId) {
      const transferAccount = await BankAccount.findOne({
        _id: transferToAccountId,
        user: req.userId
      });
      if (!transferAccount) {
        return res.status(404).json({ message: "Transfer destination account not found" });
      }
      transferAccount.balance += balance;
      transferAccount.availableBalance += balance;
      await transferAccount.save();

      await Transaction.create({
        user: req.userId,
        account: transferAccount._id,
        type: "deposit",
        category: "Account Transfer",
        amount: balance,
        description: `Transfer from closing account ${account.accountNumber}`,
        status: "completed",
        completedAt: new Date()
      });
    }

    account.status = "closed_by_customer";
    account.closureReason = req.body.reason || "Customer requested closure";
    account.closedAt = new Date();
    await account.save();

    if (balance > 0 && !transferToAccountId) {
      await Transaction.create({
        user: req.userId,
        account: account._id,
        type: "withdrawal",
        category: "Account Closure",
        amount: -balance,
        description: `Account closed. Balance refunded: ₹${balance}`,
        status: "completed",
        completedAt: new Date()
      });
    }

    res.json({ 
      message: "Account closed successfully",
      refundedAmount: balance
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
