const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const CreditCard = require("../models/CreditCard");
const BankAccount = require("../models/BankAccount");
const Transaction = require("../models/Transaction");
const Notification = require("../models/Notification");

const router = express.Router();

// Apply for Credit Card (Customer)
router.post("/apply", auth, async (req, res) => {
  try {
    const { accountId, cardType, creditLimit } = req.body;

    const account = await BankAccount.findOne({ _id: accountId, user: req.userId });
    if (!account) return res.status(404).json({ message: "Account not found" });

    const cardLimits = {
      gold: 50000,
      platinum: 100000,
      titanium: 250000,
      signature: 500000
    };

    const limit = creditLimit || cardLimits[cardType] || 50000;
    const fees = { gold: 500, platinum: 1000, titanium: 2000, signature: 5000 };

    const currentYear = new Date().getFullYear();
    const card = await CreditCard.create({
      user: req.userId,
      account: accountId,
      cardType: cardType || "gold",
      cardHolderName: `${req.body.firstName} ${req.body.lastName}`,
      expiryMonth: 12,
      expiryYear: currentYear + 5,
      cvv: Math.floor(100 + Math.random() * 900).toString(),
      creditLimit: limit,
      availableCredit: limit,
      annualFee: fees[cardType] || 500,
      status: "active"
    });

    await Notification.create({
      user: req.userId,
      type: "transaction",
      title: "Credit Card Issued",
      message: `Your ${cardType} credit card has been issued. Card ending: ${card.cardNumber.slice(-4)}`,
      priority: "high"
    });

    res.status(201).json({ message: "Credit Card applied successfully", card });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get My Credit Cards (Customer)
router.get("/my-cards", auth, async (req, res) => {
  try {
    const cards = await CreditCard.find({ user: req.userId }).populate("account");
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Card Details (Customer)
router.get("/:cardId", auth, async (req, res) => {
  try {
    const card = await CreditCard.findOne({ _id: req.params.cardId, user: req.userId }).populate("account");
    if (!card) return res.status(404).json({ message: "Card not found" });
    res.json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Pay Credit Card Bill (Customer)
router.post("/:cardId/pay-bill", auth, async (req, res) => {
  try {
    const { amount, fromAccountId } = req.body;

    const card = await CreditCard.findOne({ _id: req.params.cardId, user: req.userId });
    if (!card) return res.status(404).json({ message: "Card not found" });

    if (amount > card.outstandingAmount) {
      return res.status(400).json({ message: "Amount exceeds outstanding balance" });
    }

    const account = await BankAccount.findOne({ _id: fromAccountId, user: req.userId });
    if (!account) return res.status(404).json({ message: "Account not found" });

    if (account.availableBalance < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    account.balance -= amount;
    account.availableBalance -= amount;
    await account.save();

    card.outstandingAmount -= amount;
    card.currentBalance -= amount;
    card.availableCredit += amount;
    card.lastPaymentAmount = amount;
    card.lastPaymentDate = new Date();
    await card.save();

    await Notification.create({
      user: req.userId,
      type: "transaction",
      title: "Credit Card Payment",
      message: `Payment of ₹${amount} received. Outstanding: ₹${card.outstandingAmount}`,
      priority: "medium"
    });

    res.json({ message: "Payment successful", card });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Block Credit Card (Customer)
router.post("/:cardId/block", auth, async (req, res) => {
  try {
    const card = await CreditCard.findOne({ _id: req.params.cardId, user: req.userId });
    if (!card) return res.status(404).json({ message: "Card not found" });

    card.status = "blocked";
    await card.save();

    await Notification.create({
      user: req.userId,
      type: "security",
      title: "Card Blocked",
      message: `Your credit card ending ${card.cardNumber.slice(-4)} has been blocked`,
      priority: "high"
    });

    res.json({ message: "Card blocked successfully", card });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Credit Limit (Admin)
router.post("/:cardId/limit", auth, admin, async (req, res) => {
  try {
    const { creditLimit } = req.body;
    const card = await CreditCard.findById(req.params.cardId);
    if (!card) return res.status(404).json({ message: "Card not found" });

    const difference = creditLimit - card.creditLimit;
    card.creditLimit = creditLimit;
    card.availableCredit += difference;
    await card.save();

    res.json({ message: "Credit limit updated", card });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get All Cards (Admin)
router.get("/admin/all", auth, admin, async (req, res) => {
  try {
    const cards = await CreditCard.find().populate("user").populate("account");
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
