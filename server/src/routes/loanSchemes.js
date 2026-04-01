const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const LoanScheme = require("../models/LoanScheme");

const router = express.Router();

// Get all loan schemes (for users to view and apply)
router.get("/schemes", async (req, res) => {
  try {
    const schemes = await LoanScheme.find({ 
      $or: [{ status: "active" }, { status: { $exists: false } }, { status: null }]
    }).sort({ createdAt: -1 });
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get all loan schemes
router.get("/admin/schemes", auth, admin, async (req, res) => {
  try {
    const schemes = await LoanScheme.find().sort({ createdAt: -1 });
    res.json(schemes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Create loan scheme
router.post("/admin/schemes", auth, admin, async (req, res) => {
  try {
    const scheme = new LoanScheme(req.body);
    scheme.createdBy = req.userId;
    await scheme.save();
    res.status(201).json({ message: "Loan scheme created successfully", scheme });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Update loan scheme
router.patch("/admin/schemes/:id", auth, admin, async (req, res) => {
  try {
    const scheme = await LoanScheme.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!scheme) return res.status(404).json({ message: "Scheme not found" });
    res.json({ message: "Scheme updated successfully", scheme });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Delete loan scheme
router.delete("/admin/schemes/:id", auth, admin, async (req, res) => {
  try {
    const scheme = await LoanScheme.findByIdAndDelete(req.params.id);
    if (!scheme) return res.status(404).json({ message: "Scheme not found" });
    res.json({ message: "Scheme deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Calculate EMI based on scheme
router.post("/calculate", async (req, res) => {
  try {
    const { schemeId, amount, tenure } = req.body;
    
    const scheme = await LoanScheme.findById(schemeId);
    if (!scheme) return res.status(404).json({ message: "Scheme not found" });
    
    if (amount < scheme.minAmount || (scheme.maxAmount && amount > scheme.maxAmount)) {
      return res.status(400).json({ message: `Amount should be between ${scheme.minAmount} and ${scheme.maxAmount || 'unlimited'}` });
    }
    
    if (tenure < scheme.tenureMin || tenure > scheme.tenureMax) {
      return res.status(400).json({ message: `Tenure should be between ${scheme.tenureMin} and ${scheme.tenureMax} months` });
    }
    
    const interestRate = scheme.interestRate;
    const monthlyInterest = interestRate / 100 / 12;
    const monthlyEmi = (amount * monthlyInterest * Math.pow(1 + monthlyInterest, tenure)) / (Math.pow(1 + monthlyInterest, tenure) - 1);
    const totalRepayable = monthlyEmi * tenure;
    const totalInterest = totalRepayable - amount;
    const processingFee = (amount * scheme.processingFee) / 100;
    
    res.json({
      monthlyEmi: Math.round(monthlyEmi * 100) / 100,
      totalRepayable: Math.round(totalRepayable * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      processingFee: Math.round(processingFee * 100) / 100,
      scheme: scheme.name
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;