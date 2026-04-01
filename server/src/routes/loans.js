const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const Loan = require("../models/Loan");
const BankAccount = require("../models/BankAccount");
const Transaction = require("../models/Transaction");

const router = express.Router();

// Apply for a loan (Customer)
router.post("/apply", auth, async (req, res) => {
  try {
    const { accountId, amount, tenure, purpose } = req.body;

    const account = await BankAccount.findOne({ _id: accountId, user: req.userId });
    if (!account) return res.status(404).json({ message: "Account not found" });

    const interestRate = 12; // 12% annual interest
    const monthlyInterest = interestRate / 100 / 12;
    const monthlyEmi = (amount * monthlyInterest * Math.pow(1 + monthlyInterest, tenure)) / (Math.pow(1 + monthlyInterest, tenure) - 1);
    const totalRepayable = monthlyEmi * tenure;

    const loan = await Loan.create({
      user: req.userId,
      account: accountId,
      amount,
      interestRate,
      tenure,
      purpose,
      monthlyEmi: Math.round(monthlyEmi * 100) / 100,
      totalRepayable: Math.round(totalRepayable * 100) / 100
    });

    res.status(201).json({ message: "Loan application submitted successfully", loan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get my loans (Customer)
router.get("/my-loans", auth, async (req, res) => {
  try {
    const loans = await Loan.find({ user: req.userId }).populate("account");
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get all loans
router.get("/all", auth, admin, async (req, res) => {
  try {
    const loans = await Loan.find().populate("user").populate("account");
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Approve/Reject loan
router.patch("/:id/status", auth, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ message: "Loan not found" });

    if (loan.status !== "pending") return res.status(400).json({ message: "Loan already processed" });

    loan.status = status;
    loan.updatedAt = Date.now();

    if (status === "approved") {
      const account = await BankAccount.findById(loan.account);
      account.balance += loan.amount;
      account.availableBalance += loan.amount;
      await account.save();

      await Transaction.create({
        user: loan.user,
        account: loan.account,
        type: "deposit",
        category: "Loan Disbursal",
        amount: loan.amount,
        description: `Loan disbursed: ${loan.purpose}`,
        status: "completed",
        reference: `LOAN_${loan._id}`,
        completedAt: Date.now()
      });
    }

    await loan.save();
    res.json({ message: `Loan ${status} successfully`, loan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
