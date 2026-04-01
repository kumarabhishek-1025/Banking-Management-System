const { User } = require("../models/user.model");
const { createToken } = require("../utils/jwt");
const { createDwollaCustomer } = require("../services/dwolla.service");
const { extractCustomerIdFromUrl } = require("../utils/encoding");

exports.signUp = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    address1,
    city,
    state,
    postalCode,
    dateOfBirth,
    ssn,
  } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: "First name, last name, email and password are required" });
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: "Email already in use" });
  }

  // Try to create Dwolla customer, but continue if it fails
  let dwollaUrl = null;
  let dwollaCustomerId = null;
  
  try {
    dwollaUrl = await createDwollaCustomer({
      firstName,
      lastName,
      email,
      type: "personal",
      address1,
      city,
      state,
      postalCode,
      dateOfBirth,
      ssn,
    });
    dwollaCustomerId = dwollaUrl ? extractCustomerIdFromUrl(dwollaUrl) : null;
  } catch (error) {
    console.log("Dwolla customer creation failed, continuing without it:", error.message);
    // Continue without Dwolla - user can add it later
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    address1,
    city,
    state,
    postalCode,
    dateOfBirth,
    ssn,
    dwollaCustomerUrl: dwollaUrl,
    dwollaCustomerId,
  });

  const token = createToken({ userId: user._id.toString() });

  res.status(201).json(
    Object.assign(user.toObject(), {
      token,
    })
  );
};

exports.signIn = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = createToken({ userId: user._id.toString() });
  const sanitized = user.toObject();
  delete sanitized.password;

  res.json({ user: sanitized, token });
};

exports.me = async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = await User.findById(req.userId).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
};
