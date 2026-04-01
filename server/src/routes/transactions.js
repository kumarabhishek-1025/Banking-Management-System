const express = require("express");
const Transaction = require("../models/Transaction");
const BankAccount = require("../models/BankAccount");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all transactions
router.get("/", auth, async (req, res) => {
  try {
    const { type, startDate, endDate, limit = 50 } = req.query;
    
    // Query by customer field (primary) or user field (fallback)
    const query = { 
      $or: [
        { customer: req.userId }, 
        { user: req.userId }
      ]
    };
    
    if (type) {
      query.type = type;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate("account", "accountNumber bankName")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Add senderName calculation for display
    const processedTransactions = transactions.map(tx => {
      if (!tx.senderName && !tx.sender && !tx.recipient) {
        // For deposits/withdrawals, show "Self"
        if (tx.type === "deposit" || tx.type === "withdrawal") {
          tx.senderName = "Self";
        }
      }
      return tx;
    });

    res.json({
      transactions: processedTransactions,
      summary: {
        totalIncome: transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
        totalExpense: transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0),
        transactionCount: transactions.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get transaction by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    }).populate("account", "accountNumber bankName");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Make a payment
router.post("/payment", auth, async (req, res) => {
  try {
    const { accountId, billerName, amount, category, description } = req.body;

    if (!accountId || !billerName || !amount) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const account = await BankAccount.findOne({ 
      _id: accountId, 
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

    // Deduct from account
    account.balance -= amount;
    account.availableBalance -= amount;
    await account.save();

    // Create transaction
    const transaction = await Transaction.create({
      user: req.userId,
      account: account._id,
      type: "payment",
      category: category || "Bill Payment",
      amount: -amount,
      description: description || `Payment to ${billerName}`,
      recipient: billerName,
      status: "completed",
      paymentMethod: "online",
      completedAt: new Date()
    });

    res.json({
      message: "Payment successful",
      transaction,
      balance: account.availableBalance
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Pay a bill
router.post("/bill", auth, async (req, res) => {
  try {
    const { accountId, billType, amount, accountNumber } = req.body;

    const account = await BankAccount.findOne({ 
      _id: accountId, 
      user: req.userId 
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (account.availableBalance < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    account.balance -= amount;
    account.availableBalance -= amount;
    await account.save();

    const billers = {
      electricity: "Electricity Board",
      water: "Water Department",
      internet: "Internet Service Provider",
      phone: "Mobile Operator",
      gas: "Gas Company",
      insurance: "Insurance Company",
      creditcard: "Credit Card Company",
      other: "Other Bills"
    };

    const billerName = billers[billType] || billType;

    const transaction = await Transaction.create({
      user: req.userId,
      account: account._id,
      type: "bill",
      category: billerName,
      amount: -amount,
      description: `Bill payment for ${billerName}`,
      recipient: billerName,
      reference: accountNumber,
      status: "completed",
      paymentMethod: "online",
      completedAt: new Date()
    });

    res.json({
      message: "Bill payment successful",
      transaction,
      balance: account.availableBalance
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
