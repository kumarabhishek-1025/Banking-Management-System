const { dwollaClient } = require("../config/dwolla");

exports.createDwollaCustomer = async (payload) => {
  const response = await dwollaClient.post("customers", payload);
  return response.headers.get("location") ?? undefined;
};

exports.createFundingSource = async (customerId, name, plaidToken) => {
  const response = await dwollaClient.post(`customers/${customerId}/funding-sources`, {
    name,
    plaidToken,
  });
  return response.headers.get("location") ?? undefined;
};

exports.createTransfer = async (sourceFundingSourceUrl, destinationFundingSourceUrl, amount) => {
  const body = {
    _links: {
      source: { href: sourceFundingSourceUrl },
      destination: { href: destinationFundingSourceUrl },
    },
    amount: {
      currency: "USD",
      value: amount,
    },
  };

  const response = await dwollaClient.post("transfers", body);
  return response.headers.get("location") ?? undefined;
};
