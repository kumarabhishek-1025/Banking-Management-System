const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const Customer = require("../models/Customer");
const Account = require("../models/BankAccount");
const Transaction = require("../models/Transaction");
const KYC = require("../models/KYC");
const Complaint = require("../models/Complaint");
const Notification = require("../models/Notification");
const FixedDeposit = require("../models/FixedDeposit");
const RecurringDeposit = require("../models/RecurringDeposit");
const CreditCard = require("../models/CreditCard");
const ChequeBook = require("../models/ChequeBook");
const Loan = require("../models/Loan");
const { createAuditLog } = require("../utils/audit");

const staffAuth = (req, res, next) => {
  auth(req, res, () => {
    const { role } = req.user;
    const staffRoles = ["teller", "manager", "clerk", "auditor", "support"];
    if (staffRoles.includes(role)) {
      next();
    } else {
      res.status(403).json({ message: "Staff access required" });
    }
  });
};

router.get("/dashboard", staffAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTransactions = await Transaction.find({
      createdAt: { $gte: today },
      staffId: req.user._id
    });

    const deposits = todayTransactions.filter(t => t.type === "deposit").reduce((sum, t) => sum + t.amount, 0);
    const withdrawals = todayTransactions.filter(t => t.type === "withdrawal").reduce((sum, t) => sum + t.amount, 0);

    const pendingKYC = await KYC.countDocuments({ status: "pending" });
    const pendingComplaints = await Complaint.countDocuments({ status: { $ne: "resolved" } });

    const recentTransactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "firstName lastName");

    res.json({
      today: {
        customers: await User.countDocuments({ createdAt: { $gte: today } }) + await Customer.countDocuments({ createdAt: { $gte: today } }),
        deposits,
        withdrawals,
        transactions: todayTransactions.length
      },
      pending: {
        kyc: pendingKYC,
        complaints: pendingComplaints
      },
      recentTransactions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/customers", staffAuth, async (req, res) => {
  try {
    const { name, accountNumber, phone, email } = req.query;
    const query = {};
    
    if (name) query.firstName = new RegExp(name, "i");
    if (phone) query.phone = new RegExp(phone, "i");
    if (email) query.email = new RegExp(email, "i");

    console.log("Staff customers query:", query);

    // Query Customer collection only (User collection is deprecated)
    const customers = await Customer.find(query).limit(50).lean();
    console.log("Found customers:", customers.length);
    
    // Get accounts for each customer
    const customersWithAccounts = await Promise.all(
      customers.map(async (customer) => {
        const accounts = await Account.find({ customer: customer._id }).lean();
        console.log("Accounts for", customer.firstName, ":", accounts.length, accounts.map(a => a.accountNumber));
        const activeAccount = accounts.find(a => a.status === "active") || accounts[0];
        return {
          ...customer,
          accountNumber: activeAccount?.accountNumber,
          balance: accounts.reduce((sum, acc) => sum + acc.balance, 0),
          status: activeAccount?.status || "pending"
        };
      })
    );

    res.json({ customers: customersWithAccounts });
  } catch (error) {
    console.error("Staff customers error:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/customer/account/:accountNumber", staffAuth, async (req, res) => {
  try {
    const account = await Account.findOne({ accountNumber: req.params.accountNumber }).populate("user", "firstName lastName email phone address");
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/customers/:id", staffAuth, async (req, res) => {
  try {
    let user = await Customer.findById(req.params.id).lean();
    if (!user) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    const accounts = await BankAccount.find({ customer: req.params.id }).lean();
    const accountNumber = accounts[0]?.accountNumber;
    const balance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    
    const loans = await Loan.find({ user: req.params.id }).lean();
    
    res.json({ 
      ...user, 
      accountNumber: accountNumber, 
      balance: balance,
      loans: loans
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/customers/:id", staffAuth, async (req, res) => {
  try {
    const { phone, address } = req.body;
    // Try User first, then Customer
    let user = await User.findByIdAndUpdate(
      req.params.id,
      { phone, address },
      { new: true }
    );
    if (!user) {
      user = await Customer.findByIdAndUpdate(
        req.params.id,
        { phone, address },
        { new: true }
      );
    }
    if (!user) {
      return res.status(404).json({ message: "Customer not found" });
    }
    await createAuditLog(req.user._id, "UPDATE_CUSTOMER", `Updated customer ${user.email}`, req.ip);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/deposit", staffAuth, async (req, res) => {
  try {
    const { accountId, amount, description } = req.body;
    const account = await Account.findById(accountId);
    
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (amount > account.transactionLimit) {
      return res.status(400).json({ message: "Amount exceeds transaction limit" });
    }

    account.balance += amount;
    await account.save();

    const transaction = new Transaction({
      user: account.user,
      customer: account.user,
      account: account._id,
      type: "deposit",
      amount,
      description: description || "Cash Deposit",
      senderName: "Bank Staff",
      status: "completed",
      staffId: req.user._id
    });
    await transaction.save();

    await createAuditLog(req.user._id, "DEPOSIT", `Deposited ₹${amount} to ${account.accountNumber}`, req.ip());

    res.json({ transaction, balance: account.balance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/withdraw", staffAuth, async (req, res) => {
  try {
    const { accountId, amount, description } = req.body;
    const account = await Account.findById(accountId);
    
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (account.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    if (amount > account.withdrawalLimit) {
      return res.status(400).json({ message: "Amount exceeds withdrawal limit" });
    }

    account.balance -= amount;
    await account.save();

    const transaction = new Transaction({
      user: account.user,
      customer: account.user,
      account: account._id,
      type: "withdrawal",
      amount: -amount,
      description: description || "Cash Withdrawal",
      senderName: "Bank Staff",
      status: "completed",
      staffId: req.user._id
    });
    await transaction.save();

    await createAuditLog(req.user._id, "WITHDRAWAL", `Withdrew ₹${amount} from ${account.accountNumber}`, req.ip());

    res.json({ transaction, balance: account.balance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/transfer", staffAuth, async (req, res) => {
  try {
    const { fromAccountId, toAccountNumber, amount, description } = req.body;
    
    const fromAccount = await Account.findById(fromAccountId);
    if (!fromAccount) {
      return res.status(404).json({ message: "Source account not found" });
    }

    const toAccount = await Account.findOne({ accountNumber: toAccountNumber });
    if (!toAccount) {
      return res.status(404).json({ message: "Destination account not found" });
    }

    if (fromAccount.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    fromAccount.balance -= amount;
    toAccount.balance += amount;
    await fromAccount.save();
    await toAccount.save();

    const transaction = new Transaction({
      user: fromAccount.user,
      customer: fromAccount.user,
      account: fromAccount._id,
      type: "transfer",
      amount: -amount,
      description: description || "Internal Transfer",
      senderName: "Bank Staff",
      recipient: toAccount.user,
      status: "completed",
      staffId: req.user._id
    });
    await transaction.save();

    await createAuditLog(req.user._id, "TRANSFER", `Transferred ₹${amount} from ${fromAccount.accountNumber} to ${toAccountNumber}`, req.ip());

    res.json({ transaction, fromBalance: fromAccount.balance, toBalance: toAccount.balance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/account/create", staffAuth, async (req, res) => {
  try {
    const { userId, accountType, initialBalance } = req.body;
    
    const existingAccount = await Account.findOne({ user: userId, type: accountType, status: { $ne: "closed" } });
    if (existingAccount) {
      return res.status(400).json({ message: "Account of this type already exists" });
    }

    const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    
    const account = new Account({
      user: userId,
      accountNumber,
      type: accountType,
      balance: initialBalance || 0,
      status: "active",
      withdrawalLimit: 25000,
      transactionLimit: 100000
    });
    await account.save();

    await createAuditLog(req.user._id, "CREATE_ACCOUNT", `Created ${accountType} account ${accountNumber}`, req.ip());

    res.json({ account });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/transactions", staffAuth, async (req, res) => {
  try {
    const { type, dateFrom, dateTo } = req.query;
    const query = {};
    
    if (type) query.type = type;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("user", "firstName lastName");

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/kyc", staffAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const kycList = await KYC.find(query)
      .sort({ submittedAt: -1 })
      .populate("user", "firstName lastName email");

    res.json(kycList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/kyc/:id/review", staffAuth, async (req, res) => {
  try {
    const { status, remark } = req.body;
    const kyc = await KYC.findByIdAndUpdate(
      req.params.id,
      { status, remark, reviewedBy: req.user._id, reviewedAt: new Date() },
      { new: true }
    );

    await createAuditLog(req.user._id, "KYC_REVIEW", `Reviewed KYC: ${status}`, req.ip());

    res.json(kyc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/complaints", staffAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .populate("user", "firstName lastName email");

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/complaints/:id/respond", staffAuth, async (req, res) => {
  try {
    const { response } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { 
        response, 
        status: "in_progress",
        respondedBy: req.user._id,
        respondedAt: new Date()
      },
      { new: true }
    );

    await createAuditLog(req.user._id, "COMPLAINT_RESPONSE", `Responded to complaint`, req.ip());

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/complaints/:id/resolve", staffAuth, async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status: "resolved", resolvedAt: new Date() },
      { new: true }
    );

    await createAuditLog(req.user._id, "COMPLAINT_RESOLVED", `Resolved complaint`, req.ip());

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pending approvals count
router.get("/approvals/count", staffAuth, async (req, res) => {
  try {
    const pendingAccounts = await Account.countDocuments({ status: "pending" });
    const pendingFDs = await FixedDeposit.countDocuments({ status: "pending" });
    const pendingRDs = await RecurringDeposit.countDocuments({ status: "pending" });
    const pendingCards = await CreditCard.countDocuments({ status: "pending" });
    const pendingCheques = await ChequeBook.countDocuments({ status: "pending" });
    
    res.json({
      accounts: pendingAccounts,
      fixedDeposits: pendingFDs,
      recurringDeposits: pendingRDs,
      creditCards: pendingCards,
      chequeBooks: pendingCheques,
      total: pendingAccounts + pendingFDs + pendingRDs + pendingCards + pendingCheques
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all pending items
router.get("/approvals/pending", staffAuth, async (req, res) => {
  try {
    const { type } = req.query;
    
    let accounts = [], fds = [], rds = [], cards = [], cheques = [];
    
    if (!type || type === "accounts") {
      accounts = await Account.find({ status: "pending" }).populate("user", "firstName lastName email phone");
    }
    if (!type || type === "fds") {
      fds = await FixedDeposit.find({ status: "pending" }).populate("user", "firstName lastName email").populate("account");
    }
    if (!type || type === "rds") {
      rds = await RecurringDeposit.find({ status: "pending" }).populate("user", "firstName lastName email").populate("account");
    }
    if (!type || type === "cards") {
      cards = await CreditCard.find({ status: "pending" }).populate("user", "firstName lastName email").populate("account");
    }
    if (!type || type === "cheques") {
      cheques = await ChequeBook.find({ status: "pending" }).populate("user", "firstName lastName email").populate("account");
    }
    
    res.json({ accounts, fds, rds, cards, cheques });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve Account
router.post("/approve/account/:id", staffAuth, async (req, res) => {
  try {
    const account = await Account.findById(req.params.id).populate("user");
    if (!account) return res.status(404).json({ message: "Account not found" });
    if (account.status !== "pending") return res.status(400).json({ message: "Account is not pending" });

    account.status = "active";
    account.approvedBy = req.user._id;
    account.approvedAt = new Date();
    await account.save();

    await Notification.create({
      user: account.user._id,
      type: "account",
      title: "Account Approved!",
      message: `Your bank account ending with ${account.accountNumber.slice(-4)} has been approved and is now active.`,
      priority: "high"
    });

    await createAuditLog(req.user._id, "ACCOUNT_APPROVED", `Approved account ${account.accountNumber}`, req.ip);

    res.json({ message: "Account approved successfully", account });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject Account
router.post("/reject/account/:id", staffAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    const account = await Account.findById(req.params.id).populate("user");
    if (!account) return res.status(404).json({ message: "Account not found" });

    account.status = "rejected";
    account.rejectionReason = reason;
    account.approvedBy = req.user._id;
    account.approvedAt = new Date();
    await account.save();

    await Notification.create({
      user: account.user._id,
      type: "account",
      title: "Account Rejected",
      message: `Your account application has been rejected. Reason: ${reason || "Not specified"}`,
      priority: "high"
    });

    res.json({ message: "Account rejected", account });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve Fixed Deposit
router.post("/approve/fd/:id", staffAuth, async (req, res) => {
  try {
    const fd = await FixedDeposit.findById(req.params.id).populate("user");
    if (!fd) return res.status(404).json({ message: "FD not found" });
    if (fd.status !== "pending") return res.status(400).json({ message: "FD is not pending" });

    const account = await Account.findById(fd.account);
    if (!account || account.availableBalance < fd.amount) {
      return res.status(400).json({ message: "Insufficient balance in account" });
    }

    account.balance -= fd.amount;
    account.availableBalance -= fd.amount;
    await account.save();

    fd.status = "active";
    fd.approvedBy = req.user._id;
    fd.approvedAt = new Date();
    await fd.save();

    await Transaction.create({
      user: fd.user._id,
      account: fd.account,
      type: "transfer",
      category: "Fixed Deposit",
      amount: fd.amount,
      description: `FD Approved: ${fd.schemeName} - ${fd.tenure} months @ ${fd.interestRate}%`,
      status: "completed",
      completedAt: Date.now()
    });

    await Notification.create({
      user: fd.user._id,
      type: "transaction",
      title: "Fixed Deposit Approved!",
      message: `Your Fixed Deposit of ₹${fd.amount} for ${fd.tenure} months has been approved and amount deducted.`,
      priority: "high"
    });

    res.json({ message: "FD approved successfully", fd });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject Fixed Deposit
router.post("/reject/fd/:id", staffAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    const fd = await FixedDeposit.findById(req.params.id).populate("user");
    if (!fd) return res.status(404).json({ message: "FD not found" });

    const account = await Account.findById(fd.account);
    if (account) {
      account.balance += fd.amount;
      account.availableBalance += fd.amount;
      await account.save();
    }

    fd.status = "rejected";
    fd.rejectionReason = reason;
    fd.approvedBy = req.user._id;
    fd.approvedAt = new Date();
    await fd.save();

    await Notification.create({
      user: fd.user._id,
      type: "transaction",
      title: "Fixed Deposit Rejected",
      message: `Your FD application has been rejected. Amount has been refunded. Reason: ${reason || "Not specified"}`,
      priority: "high"
    });

    res.json({ message: "FD rejected and amount refunded", fd });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve Recurring Deposit
router.post("/approve/rd/:id", staffAuth, async (req, res) => {
  try {
    const rd = await RecurringDeposit.findById(req.params.id).populate("user");
    if (!rd) return res.status(404).json({ message: "RD not found" });
    if (rd.status !== "pending") return res.status(400).json({ message: "RD is not pending" });

    const account = await Account.findById(rd.account);
    if (!account || account.availableBalance < rd.monthlyAmount) {
      return res.status(400).json({ message: "Insufficient balance in account for first deposit" });
    }

    account.balance -= rd.monthlyAmount;
    account.availableBalance -= rd.monthlyAmount;
    await account.save();

    rd.status = "active";
    rd.approvedBy = req.user._id;
    rd.approvedAt = new Date();
    rd.totalDeposited = rd.monthlyAmount;
    rd.currentDeposit = rd.monthlyAmount;
    rd.depositCount = 1;
    await rd.save();

    await Transaction.create({
      user: rd.user._id,
      account: rd.account,
      type: "deposit",
      category: "Recurring Deposit",
      amount: rd.monthlyAmount,
      description: `RD Approved: ${rd.schemeName} - First deposit`,
      status: "completed",
      completedAt: Date.now()
    });

    await Notification.create({
      user: rd.user._id,
      type: "transaction",
      title: "Recurring Deposit Approved!",
      message: `Your RD of ₹${rd.monthlyAmount}/month for ${rd.tenureMonths} months has been approved. First deposit of ₹${rd.monthlyAmount} deducted.`,
      priority: "high"
    });

    res.json({ message: "RD approved successfully", rd });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject Recurring Deposit
router.post("/reject/rd/:id", staffAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    const rd = await RecurringDeposit.findById(req.params.id).populate("user");
    if (!rd) return res.status(404).json({ message: "RD not found" });

    const account = await Account.findById(rd.account);
    if (account) {
      account.balance += rd.monthlyAmount;
      account.availableBalance += rd.monthlyAmount;
      await account.save();
    }

    rd.status = "rejected";
    rd.rejectionReason = reason;
    rd.approvedBy = req.user._id;
    rd.approvedAt = new Date();
    await rd.save();

    await Notification.create({
      user: rd.user._id,
      type: "transaction",
      title: "Recurring Deposit Rejected",
      message: `Your RD application has been rejected. First deposit has been refunded.`,
      priority: "high"
    });

    res.json({ message: "RD rejected and amount refunded", rd });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve Credit Card
router.post("/approve/card/:id", staffAuth, async (req, res) => {
  try {
    const card = await CreditCard.findById(req.params.id).populate("user");
    if (!card) return res.status(404).json({ message: "Card not found" });
    if (card.status !== "pending") return res.status(400).json({ message: "Card is not pending" });

    card.status = "active";
    card.approvedBy = req.user._id;
    card.approvedAt = new Date();
    card.issueDate = new Date();
    await card.save();

    await Notification.create({
      user: card.user._id,
      type: "card",
      title: "Credit Card Approved!",
      message: `Your ${card.cardType} credit card ending with ${card.cardNumber.slice(-4)} has been approved and issued.`,
      priority: "high"
    });

    res.json({ message: "Card approved successfully", card });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject Credit Card
router.post("/reject/card/:id", staffAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    const card = await CreditCard.findById(req.params.id).populate("user");
    if (!card) return res.status(404).json({ message: "Card not found" });

    card.status = "rejected";
    card.rejectionReason = reason;
    card.approvedBy = req.user._id;
    card.approvedAt = new Date();
    await card.save();

    await Notification.create({
      user: card.user._id,
      type: "card",
      title: "Credit Card Rejected",
      message: `Your credit card application has been rejected. Reason: ${reason || "Not specified"}`,
      priority: "high"
    });

    res.json({ message: "Card rejected", card });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve Cheque Book
router.post("/approve/cheque/:id", staffAuth, async (req, res) => {
  try {
    const cheque = await ChequeBook.findById(req.params.id).populate("user");
    if (!cheque) return res.status(404).json({ message: "Cheque book not found" });
    if (cheque.status !== "pending") return res.status(400).json({ message: "Cheque book is not pending" });

    cheque.status = "approved";
    cheque.approvedBy = req.user._id;
    cheque.approvedAt = new Date();
    await cheque.save();

    await Notification.create({
      user: cheque.user._id,
      type: "cheque",
      title: "Cheque Book Approved!",
      message: `Your cheque book request (${cheque.leafCount} leaves) has been approved.`,
      priority: "medium"
    });

    res.json({ message: "Cheque book approved", cheque });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reject Cheque Book
router.post("/reject/cheque/:id", staffAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    const cheque = await ChequeBook.findById(req.params.id).populate("user");
    if (!cheque) return res.status(404).json({ message: "Cheque book not found" });

    cheque.status = "rejected";
    cheque.rejectionReason = reason;
    cheque.approvedBy = req.user._id;
    cheque.approvedAt = new Date();
    await cheque.save();

    await Notification.create({
      user: cheque.user._id,
      type: "cheque",
      title: "Cheque Book Rejected",
      message: `Your cheque book request has been rejected. Reason: ${reason || "Not specified"}`,
      priority: "medium"
    });

    res.json({ message: "Cheque book rejected", cheque });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Issue Cheque Book (after approval)
router.post("/issue/cheque/:id", staffAuth, async (req, res) => {
  try {
    const cheque = await ChequeBook.findById(req.params.id);
    if (!cheque) return res.status(404).json({ message: "Cheque book not found" });
    if (cheque.status !== "approved") return res.status(400).json({ message: "Cheque book must be approved first" });

    cheque.status = "issued";
    cheque.dispatchedAt = new Date();
    await cheque.save();

    await Notification.create({
      user: cheque.user,
      type: "cheque",
      title: "Cheque Book Issued!",
      message: `Your cheque book has been issued. Cheque numbers: ${cheque.startChequeNumber} - ${cheque.endChequeNumber}`,
      priority: "high"
    });

    res.json({ message: "Cheque book issued", cheque });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
