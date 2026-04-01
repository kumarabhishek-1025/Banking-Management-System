const { BankAccount } = require("../models/bank.model");
const { TransferTransaction } = require("../models/transaction.model");
const { fetchAccountInfo, fetchTransactionsForAccessToken } = require("../services/plaid.service");
const { createFundingSource } = require("../services/dwolla.service");
const { createShareableId } = require("../utils/encoding");
const { plaidClient } = require("../config/plaid");
const { User } = require("../models/user.model");

exports.getAccounts = async (req, res) => {
  if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

  const banks = await BankAccount.find({ user: req.userId });

  const enriched = await Promise.all(
    banks.map(async (bank) => {
      const { account, institution } = await fetchAccountInfo(bank.accessToken);
      await BankAccount.findByIdAndUpdate(bank._id, {
        currentBalance: account.currentBalance ?? bank.currentBalance,
        availableBalance: account.availableBalance ?? bank.availableBalance,
      });
      return {
        ...bank.toObject(),
        account,
        institution,
      };
    })
  );

  const totalCurrentBalance = enriched.reduce((acc, bank) => acc + (bank.account.currentBalance ?? 0), 0);

  res.json({
    data: enriched,
    totalBanks: enriched.length,
    totalCurrentBalance,
  });
};

exports.getAccount = async (req, res) => {
  const { accountId } = req.params;
  if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

  const bank = await BankAccount.findById(accountId);
  if (!bank) return res.status(404).json({ message: "Bank not found" });
  if (bank.user.toString() !== req.userId) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { account } = await fetchAccountInfo(bank.accessToken, bank.accountId);
  const plaidTransactions = await fetchTransactionsForAccessToken(bank.accessToken);

  const transferTransactions = await TransferTransaction.find({
    $or: [{ senderBankId: bank._id }, { receiverBankId: bank._id }],
  });

  const allTransactions = [
    ...plaidTransactions.map((tx) => ({
      id: tx.id,
      name: tx.name,
      amount: tx.amount,
      date: tx.date,
      paymentChannel: tx.paymentChannel,
      type: "plaid",
      category: tx.category,
      accountName: bank.name,
      pending: false,
    })),
    ...transferTransactions.map((tx) => ({
      id: tx._id,
      name: tx.name,
      amount: tx.amount,
      date: tx.date.toISOString(),
      paymentChannel: tx.paymentChannel,
      type: tx.type,
      category: tx.category,
      accountName: bank.name,
      pending: false,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.json({
    bank: {
      ...bank.toObject(),
      account,
    },
    transactions: allTransactions,
  });
};

exports.linkAccount = async (req, res) => {
  const { publicToken } = req.body;
  if (!req.userId) return res.status(401).json({ message: "Unauthorized" });
  if (!publicToken) return res.status(400).json({ message: "publicToken is required" });

  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.role && user.role !== "customer") {
    return res.status(403).json({ message: "Only customers can link accounts" });
  }

  const exchange = await plaidClient.itemPublicTokenExchange({ public_token: publicToken });
  const accessToken = exchange.data.access_token;
  const itemId = exchange.data.item_id;

  const accountResponse = await plaidClient.accountsGet({ access_token: accessToken });
  const accountSource = accountResponse.data.accounts[0];

  const processorRequest = {
    access_token: accessToken,
    account_id: accountSource.account_id,
    processor: "dwolla",
  };

  const processorTokenResponse = await plaidClient.processorTokenCreate(processorRequest);
  const processorToken = processorTokenResponse.data.processor_token;

  const user = await User.findById(req.userId);
  if (!user?.dwollaCustomerId) {
    return res.status(400).json({ message: "Dwolla customer missing" });
  }

  const fundingSourceUrl = await createFundingSource(
    user.dwollaCustomerId,
    accountSource.name,
    processorToken
  );

  if (!fundingSourceUrl) {
    return res.status(500).json({ message: "Unable to create funding source" });
  }

  const account = await BankAccount.create({
    user: req.userId,
    bankId: itemId,
    accountId: accountSource.account_id,
    accessToken,
    fundingSourceUrl,
    shareableId: createShareableId(accountSource.account_id),
    name: accountSource.name,
    officialName: accountSource.official_name,
    mask: accountSource.mask,
    institutionId: accountResponse.data.item.institution_id,
    type: accountSource.type,
    subtype: accountSource.subtype,
    currentBalance: accountSource.balances.current,
    availableBalance: accountSource.balances.available,
  });

  return res.status(201).json(account);
};
