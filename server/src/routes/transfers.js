const express = require("express");
const Transfer = require("../models/Transfer");
const BankAccount = require("../models/BankAccount");
const Transaction = require("../models/Transaction");
const Notification = require("../models/Notification");
const Customer = require("../models/Customer");
const auth = require("../middleware/auth");

const router = express.Router();

const CHARGES = {
  IMPS: { min: 1, max: 1000000, fee: 15 },
  RTGS: { min: 200000, max: 10000000, fee: 25 },
  NEFT: { min: 1, max: 10000000, fee: 10 }
};

const calculateCharges = (type, amount) => {
  const charge = CHARGES[type];
  if (!charge) return 0;
  if (amount < charge.min || amount > charge.max) return 0;
  return charge.fee;
};

const validateTransferType = (type, amount) => {
  const rules = CHARGES[type];
  if (!rules) return { valid: false, message: `Invalid transfer type. Use: IMPS, RTGS, or NEFT` };
  if (amount < rules.min) return { valid: false, message: `Minimum amount for ${type} is ₹${rules.min}` };
  if (amount > rules.max) return { valid: false, message: `Maximum amount for ${type} is ₹${rules.max}` };
  return { valid: true, fee: rules.fee };
};

// Transfer money
router.post("/send", auth, async (req, res) => {
  try {
    const { fromAccountId, toAccountNumber, amount, description, reference } = req.body;

    if (!fromAccountId || !toAccountNumber || !amount) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const senderAccount = await BankAccount.findOne({ 
      _id: fromAccountId, 
      user: req.userId 
    });

    if (!senderAccount) {
      return res.status(404).json({ message: "Sender account not found" });
    }

    // Check if account is active (approved by admin)
    if (senderAccount.status !== "active") {
      return res.status(403).json({ message: "Your account is not approved yet. Please wait for admin approval." });
    }

    if (senderAccount.availableBalance < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    const receiverAccount = await BankAccount.findOne({ 
      accountNumber: toAccountNumber 
    });

    if (!receiverAccount) {
      return res.status(404).json({ message: "Receiver account not found" });
    }

    if (receiverAccount.status !== "active") {
      return res.status(403).json({ message: "Receiver account is not active yet. Please wait for admin approval." });
    }

    if (senderAccount._id.toString() === receiverAccount._id.toString()) {
      return res.status(400).json({ message: "Cannot transfer to the same account" });
    }

    // Deduct from sender
    senderAccount.balance -= amount;
    senderAccount.availableBalance -= amount;
    await senderAccount.save();

    // Add to receiver
    receiverAccount.balance += amount;
    receiverAccount.availableBalance += amount;
    await receiverAccount.save();

    // Create transfer record
    const transfer = await Transfer.create({
      sender: req.userId,
      senderAccount: senderAccount._id,
      receiver: receiverAccount.user,
      receiverAccount: receiverAccount._id,
      amount,
      description,
      reference,
      status: "completed",
      completedAt: new Date()
    });

    // Create transaction for sender
    const senderUser = await Customer.findById(req.userId);
    const senderName = senderUser ? `${senderUser.firstName} ${senderUser.lastName}` : "Unknown";
    
    // Create transaction for sender
    await Transaction.create({
      user: req.userId,
      customer: req.userId,
      account: senderAccount._id,
      type: "transfer",
      category: "Transfer",
      amount: -amount,
      description: description || `Transfer to ${receiverAccount.bankName}`,
      recipient: receiverAccount.accountNumber.slice(-4),
      senderName: senderName,
      status: "completed",
      paymentMethod: "online",
      completedAt: new Date()
    });

    // Create transaction for receiver
    await Transaction.create({
      user: receiverAccount.user,
      customer: receiverAccount.user,
      account: receiverAccount._id,
      type: "transfer",
      category: "Transfer Received",
      amount: amount,
      description: `Received from ${senderName} (${senderAccount.accountNumber}) on ${new Date().toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}`,
      sender: senderAccount.accountNumber.slice(-4),
      senderName: senderName,
      senderAccountNumber: senderAccount.accountNumber,
      status: "completed",
      paymentMethod: "online",
      completedAt: new Date()
    });

    res.json({
      message: "Transfer successful",
      transfer: {
        id: transfer._id,
        amount,
        to: receiverAccount.accountNumber.slice(-4),
        status: transfer.status
      },
      senderBalance: senderAccount.availableBalance
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// External Transfer (IMPS/RTGS/NEFT)
router.post("/external", auth, async (req, res) => {
  try {
    const { 
      fromAccountId, 
      toAccountNumber, 
      toIFSC, 
      toBankName, 
      toBeneficiaryName,
      amount, 
      type = "IMPS",
      description 
    } = req.body;

    if (!fromAccountId || !toAccountNumber || !toIFSC || !toBeneficiaryName || !amount) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const validation = validateTransferType(type.toUpperCase(), amount);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    const senderAccount = await BankAccount.findOne({ 
      _id: fromAccountId, 
      user: req.userId 
    });

    if (!senderAccount) {
      return res.status(404).json({ message: "Sender account not found" });
    }

    const charges = calculateCharges(type.toUpperCase(), amount);
    const totalDebit = amount + charges;

    if (senderAccount.availableBalance < totalDebit) {
      return res.status(400).json({ message: "Insufficient funds (including transfer charges)" });
    }

    senderAccount.balance -= totalDebit;
    senderAccount.availableBalance -= totalDebit;
    await senderAccount.save();

    const transfer = await Transfer.create({
      sender: req.userId,
      senderAccount: senderAccount._id,
      amount,
      type: type.toUpperCase(),
      description,
      beneficiary: {
        name: toBeneficiaryName,
        accountNumber: toAccountNumber,
        ifsc: toIFSC,
        bankName: toBankName
      },
      status: "completed",
      completedAt: new Date(),
      charges
    });

    await Transaction.create({
      user: req.userId,
      account: senderAccount._id,
      type: "transfer",
      category: `External Transfer (${type.toUpperCase()})`,
      amount: -totalDebit,
      description: description || `Transfer to ${toBeneficiaryName} via ${type.toUpperCase()}`,
      recipient: toAccountNumber.slice(-4),
      status: "completed",
      paymentMethod: type.toLowerCase(),
      completedAt: new Date()
    });

    await Notification.create({
      user: req.userId,
      type: "transaction",
      title: "External Transfer Successful",
      message: `₹${amount} transferred to ${toBeneficiaryName} via ${type.toUpperCase()}. Charges: ₹${charges}`,
      priority: "high"
    });

    res.json({
      message: "External transfer successful",
      transfer: {
        id: transfer._id,
        type: type.toUpperCase(),
        amount,
        charges,
        beneficiary: toBeneficiaryName,
        status: transfer.status,
        utr: "UTR" + Date.now() + Math.floor(Math.random() * 1000)
      },
      senderBalance: senderAccount.availableBalance
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get transfer charges
router.get("/charges/:type/:amount", auth, async (req, res) => {
  try {
    const { type, amount } = req.params;
    const numAmount = parseFloat(amount);
    
    const validation = validateTransferType(type.toUpperCase(), numAmount);
    
    res.json({
      type: type.toUpperCase(),
      amount: numAmount,
      charges: validation.valid ? calculateCharges(type.toUpperCase(), numAmount) : 0,
      valid: validation.valid,
      message: validation.message || null,
      limits: CHARGES[type.toUpperCase()]
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get transfer history
router.get("/history", auth, async (req, res) => {
  try {
    const transfers = await Transfer.find({
      $or: [{ sender: req.userId }, { receiver: req.userId }]
    })
    .populate("senderAccount", "accountNumber bankName")
    .populate("receiverAccount", "accountNumber bankName")
    .sort({ createdAt: -1 })
    .limit(50);

    const sent = transfers.filter(t => t.sender.toString() === req.userId.toString());
    const received = transfers.filter(t => t.receiver.toString() === req.userId.toString());

    res.json({
      transfers,
      summary: {
        totalSent: sent.reduce((sum, t) => sum + t.amount, 0),
        totalReceived: received.reduce((sum, t) => sum + t.amount, 0),
        sentCount: sent.length,
        receivedCount: received.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Request money
router.post("/request", auth, async (req, res) => {
  try {
    const { fromAccountNumber, amount, description } = req.body;

    // For demo, we'll just send a success response
    // In production, this would create a payment request
    
    res.json({
      message: "Payment request sent",
      requestId: "REQ" + Date.now(),
      amount,
      from: fromAccountNumber.slice(-4),
      description
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
