const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET must be defined");
}

exports.createToken = (payload) =>
  jwt.sign(payload, secret, { expiresIn: "2h" });

exports.verifyToken = (token) => jwt.verify(token, secret);
