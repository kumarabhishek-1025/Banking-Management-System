const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");

const environment = process.env.PLAID_ENV ?? "sandbox";

if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
  throw new Error("Plaid credentials are missing");
}

const configuration = new Configuration({
  basePath: PlaidEnvironments[environment],
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
});

exports.plaidClient = new PlaidApi(configuration);
