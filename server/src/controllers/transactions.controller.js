const { TransferTransaction } = require("../models/transaction.model");

exports.listTransactions = async (req, res) => {
  if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

  const transactions = await TransferTransaction.find({
    $or: [{ senderId: req.userId }, { receiverId: req.userId }],
  }).sort({ createdAt: -1 });

  res.json({ data: transactions });
};
