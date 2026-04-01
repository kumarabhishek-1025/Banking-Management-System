const { TransferTransaction } = require("../models/transaction.model");
const { BankAccount } = require("../models/bank.model");
const { createTransfer } = require("../services/dwolla.service");
const { decodeShareableId } = require("../utils/encoding");

exports.initiateTransfer = async (req, res) => {
  const { amount, senderBankId, receiverShareableId, note, email } = req.body;
  if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

  if (!amount || !senderBankId || !receiverShareableId) {
    return res.status(400).json({ message: "Amount, senderBankId and shareableId are required" });
  }

  const senderBank = await BankAccount.findById(senderBankId);
  if (!senderBank) return res.status(404).json({ message: "Sender bank not found" });
  if (senderBank.user.toString() !== req.userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const receiverAccountId = decodeShareableId(receiverShareableId);
  const receiverBank = await BankAccount.findOne({ accountId: receiverAccountId });
  if (!receiverBank) return res.status(404).json({ message: "Receiver bank not found" });

  if (!senderBank.fundingSourceUrl || !receiverBank.fundingSourceUrl) {
    return res.status(400).json({ message: "Funding source unavailable" });
  }

  const transferLocation = await createTransfer(
    senderBank.fundingSourceUrl,
    receiverBank.fundingSourceUrl,
    amount
  );

  if (!transferLocation) {
    return res.status(500).json({ message: "Transfer failed" });
  }

  const transaction = await TransferTransaction.create({
    name: note || "Transfer",
    amount: Number(amount),
    senderBankId: senderBank._id,
    receiverBankId: receiverBank._id,
    senderId: senderBank.user,
    receiverId: receiverBank.user,
    email,
    paymentChannel: "online",
    type: "dwolla",
  });

  res.status(201).json(transaction);
};
