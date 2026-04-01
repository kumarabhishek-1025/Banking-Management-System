const express = require("express");
const auth = require("../middleware/auth");
const BankAccount = require("../models/BankAccount");
const Transaction = require("../models/Transaction");

const router = express.Router();

// Get config
router.get("/config", (req, res) => {
  res.json({
    mockMode: true,
    keyName: "Horizon Bank Simulator"
  });
});

// Create simulated order
router.post("/create-order", auth, async (req, res) => {
  try {
    const { amount, accountId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (!accountId) {
      return res.status(400).json({ message: "Account ID required" });
    }

    // Verify account belongs to user
    const account = await BankAccount.findOne({ 
      _id: accountId, 
      user: req.userId 
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Create a mock order ID
    const orderId = "mock_order_" + Date.now();

    res.json({
      orderId,
      amount: Math.round(amount * 100),
      currency: "INR",
      mockMode: true
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Error creating mock order", error: error.message });
  }
});

// Verify mock payment and add money
router.post("/verify-payment", auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, accountId, amount } = req.body;

    // Find account and add money
    const account = await BankAccount.findOne({ 
      _id: accountId, 
      user: req.userId 
    });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Check if account is active (approved by admin) - allow deposits even for pending accounts
    // Users can add money to pending accounts, but can't withdraw/transfer until approved
    
    // Update balance
    account.balance += parseFloat(amount);
    account.availableBalance += parseFloat(amount);
    await account.save();

    // Create transaction record
    const transaction = await Transaction.create({
      user: req.userId,
      account: account._id,
      type: "deposit",
      category: "Mock Deposit",
      amount: parseFloat(amount),
      description: `Simulated deposit via Mock Gateway (${razorpay_payment_id?.slice(-8)})`,
      status: "completed",
      paymentMethod: "mock",
      reference: razorpay_payment_id || "mock_" + Date.now(),
      completedAt: new Date()
    });

    res.json({
      message: "Mock payment successful!",
      account,
      transaction,
      balance: account.availableBalance
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ message: "Error processing mock payment", error: error.message });
  }
});

// Get payment by ID (Mock)
router.get("/payment/:id", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ 
      _id: req.params.id, 
      user: req.userId,
      type: "deposit"
    });

    if (!transaction) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
