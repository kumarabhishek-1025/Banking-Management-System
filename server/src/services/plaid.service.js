const { plaidClient } = require("../config/plaid");

exports.fetchAccountInfo = async (accessToken, accountId) => {
  const response = await plaidClient.accountsGet({ access_token: accessToken });
  const accountSource = accountId
    ? response.data.accounts.find((account) => account.account_id === accountId)
    : response.data.accounts[0];

  if (!accountSource) {
    throw new Error("Account not found");
  }

  const institutionId = response.data.item.institution_id;
  let institution;

  if (institutionId) {
    const institutionResponse = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: ["US"],
    });

    institution = institutionResponse.data.institution;
  }

  return {
    account: {
      id: accountSource.account_id,
      name: accountSource.name,
      officialName: accountSource.official_name,
      mask: accountSource.mask,
      type: accountSource.type,
      subtype: accountSource.subtype,
      currentBalance: accountSource.balances.current,
      availableBalance: accountSource.balances.available,
    },
    institution,
  };
};

exports.fetchTransactionsForAccessToken = async (accessToken) => {
  let hasMore = true;
  let cursor = undefined;
  const transactions = [];

  while (hasMore) {
    const response = await plaidClient.transactionsSync({
      access_token: accessToken,
      cursor,
    });

    const data = response.data;

    const newTransactions = data.added.map((transaction) => ({
      id: transaction.transaction_id,
      name: transaction.name,
      amount: transaction.amount,
      date: transaction.date,
      paymentChannel: transaction.payment_channel,
      type: transaction.payment_channel,
      category: transaction.category ? transaction.category[0] : "Uncategorized",
      accountId: transaction.account_id,
      image: transaction.logo_url,
    }));

    transactions.push(...newTransactions);
    hasMore = data.has_more;
    cursor = data.next_cursor ?? cursor;
    if (!data.has_more) {
      break;
    }
  }

  return transactions;
};
