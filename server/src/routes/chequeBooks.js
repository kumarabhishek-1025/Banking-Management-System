const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const ChequeBook = require("../models/ChequeBook");
const BankAccount = require("../models/BankAccount");
const Notification = require("../models/Notification");

const router = express.Router();

// Request Cheque Book (Customer)
router.post("/request", auth, async (req, res) => {
  try {
    const { accountId, leafCount, deliveryMode, deliveryAddress } = req.body;

    const account = await BankAccount.findOne({ _id: accountId, user: req.userId });
    if (!account) return res.status(404).json({ message: "Account not found" });

    const startNumber = Math.floor(100001 + Math.random() * 900000).toString();
    const endNumber = (parseInt(startNumber) + (leafCount || 25) - 1).toString();

    const chequeBook = await ChequeBook.create({
      user: req.userId,
      account: accountId,
      startChequeNumber: startNumber,
      endChequeNumber: endNumber,
      leafCount: leafCount || 25,
      deliveryMode: deliveryMode || "courier",
      deliveryAddress: deliveryAddress,
      status: "pending"
    });

    await Notification.create({
      user: req.userId,
      type: "transaction",
      title: "Cheque Book Requested",
      message: `Your cheque book request (${leafCount || 25} leaves) has been submitted`,
      priority: "medium"
    });

    res.status(201).json({ message: "Cheque book requested successfully", chequeBook });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get My Cheque Books (Customer)
router.get("/my-chequebooks", auth, async (req, res) => {
  try {
    const chequeBooks = await ChequeBook.find({ user: req.userId }).populate("account");
    res.json(chequeBooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Stop Payment on Cheque (Customer)
router.post("/stop-payment", auth, async (req, res) => {
  try {
    const { accountId, chequeNumber, reason } = req.body;

    const account = await BankAccount.findOne({ _id: accountId, user: req.userId });
    if (!account) return res.status(404).json({ message: "Account not found" });

    // In production, this would create a stop payment record
    // For demo, we'll just return success
    const stopPayment = {
      chequeNumber,
      reason,
      status: "active",
      createdAt: new Date(),
      charges: 150
    };

    await Notification.create({
      user: req.userId,
      type: "alert",
      title: "Stop Payment Registered",
      message: `Stop payment registered for cheque ${chequeNumber}. Charges: ₹150`,
      priority: "high"
    });

    res.json({ message: "Stop payment registered successfully", stopPayment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get All Cheque Books
router.get("/admin/all", auth, admin, async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const chequeBooks = await ChequeBook.find(query).populate("user").populate("account");
    res.json(chequeBooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Issue Cheque Book
router.post("/:id/issue", auth, admin, async (req, res) => {
  try {
    const chequeBook = await ChequeBook.findById(req.params.id);
    if (!chequeBook) return res.status(404).json({ message: "Cheque book not found" });

    if (chequeBook.status !== "pending") {
      return res.status(400).json({ message: "Cheque book already processed" });
    }

    chequeBook.status = "issued";
    chequeBook.dispatchedAt = new Date();
    await chequeBook.save();

    await Notification.create({
      user: chequeBook.user,
      type: "transaction",
      title: "Cheque Book Issued",
      message: `Your cheque book has been issued. Cheques: ${chequeBook.startChequeNumber} - ${chequeBook.endChequeNumber}`,
      priority: "high"
    });

    res.json({ message: "Cheque book issued", chequeBook });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Deliver Cheque Book
router.post("/:id/deliver", auth, admin, async (req, res) => {
  try {
    const chequeBook = await ChequeBook.findById(req.params.id);
    if (!chequeBook) return res.status(404).json({ message: "Cheque book not found" });

    chequeBook.status = "delivered";
    chequeBook.deliveryDate = new Date();
    chequeBook.receivedAt = new Date();
    await chequeBook.save();

    res.json({ message: "Cheque book delivered", chequeBook });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
