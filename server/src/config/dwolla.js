const Dwolla = require("dwolla-v2");

const environment = process.env.DWOLLA_ENV === "production" ? "production" : "sandbox";

if (!process.env.DWOLLA_KEY || !process.env.DWOLLA_SECRET) {
  throw new Error("Dwolla credentials are missing");
}

exports.dwollaClient = new Dwolla.Client({
  environment,
  key: process.env.DWOLLA_KEY,
  secret: process.env.DWOLLA_SECRET,
});
