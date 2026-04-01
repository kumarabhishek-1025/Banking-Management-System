const express = require("express");
const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { sendOTPEmail, sendVerificationEmail } = require("../utils/email");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "horizon-bank-secret-key-2024";

// Register Admin (Secret route - use once to create admin)
router.post("/register-admin", async (req, res) => {
  try {
    const { firstName, lastName, email, password, secretKey } = req.body;

    // Secret key to prevent unauthorized admin creation
    const ADMIN_SECRET = process.env.ADMIN_SECRET || "horizon-admin-2024";
    
    if (secretKey !== ADMIN_SECRET) {
      return res.status(403).json({ message: "Invalid admin secret key" });
    }

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      existingCustomer.role = "admin";
      await existingCustomer.save();
      return res.json({ message: "Customer promoted to admin", user: { id: existingCustomer._id, email: existingCustomer.email, role: existingCustomer.role } });
    }

    const user = new Customer({
      firstName,
      lastName,
      email,
      password,
      role: "admin"
    });

    await user.save();

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "Admin registered successfully",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Make user admin (admin only)
router.post("/make-admin/:userId", auth, admin, async (req, res) => {
  try {
    const user = await Customer.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "Customer not found" });
    }
    user.role = "admin";
    await user.save();
    res.json({ message: "Customer is now admin", user: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all users (admin only)
router.get("/users", auth, admin, async (req, res) => {
  try {
    const users = await Customer.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Register - Step 1: Create account and send OTP
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, address, city, state, postalCode, dateOfBirth } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const user = new Customer({
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      city,
      state,
      postalCode,
      dateOfBirth,
      isEmailVerified: false,
      verificationOTP: otp,
      verificationOTPExpiry: Date.now() + 15 * 60 * 1000,
      role: "customer"
    });

    await user.save();

    // Send verification email
    let emailSent = false;
    let generatedOTP = otp;
    try {
      emailSent = await sendVerificationEmail(email, otp);
    } catch (emailError) {
      console.error("Email sending error:", emailError.message);
    }
    
    // Only show OTP if email fails (for testing)
    if (emailSent) {
      res.status(201).json({
        message: "OTP sent to your email. Please verify to complete registration.",
        emailSent: true,
        pending: true,
        userId: user._id
      });
    } else {
      res.status(201).json({
        message: "OTP sent (email failed - using fallback)",
        emailSent: false,
        pending: true,
        userId: user._id,
        otp: generatedOTP
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Verify Registration OTP - Step 2
router.post("/verify-registration-otp", async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: "Customer ID and OTP are required" });
    }

    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (user.verificationOTP !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > user.verificationOTPExpiry) {
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.verificationOTP = undefined;
    user.verificationOTPExpiry = undefined;
    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Email verified successfully. Account created!",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Resend Registration OTP
router.post("/resend-registration-otp", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "Customer ID is required" });
    }

    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationOTP = otp;
    user.verificationOTPExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Send verification email
    const emailSent = await sendVerificationEmail(user.email, otp);
    
    if (emailSent) {
      res.json({ 
        message: "New OTP sent to your email",
        emailSent: true
      });
    } else {
      res.json({ 
        message: "OTP sent (email failed - using fallback)",
        emailSent: false,
        otp: otp
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Login - Step 1: Verify password, send OTP (for customers only)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const user = await Customer.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if email is verified (for new users)
    if (!user.isEmailVerified) {
      return res.status(401).json({ 
        message: "Please verify your email first",
        emailVerified: false,
        userId: user._id
      });
    }

    // Admin/Staff should use employee login, not customer login
    if (user.role === "admin" || user.role === "teller" || user.role === "manager" || user.role === "clerk") {
      return res.status(401).json({ 
        message: "Admin/Staff login - Please use admin portal",
        isAdmin: true
      });
    }

    // Customer login - Generate OTP for 2FA
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationOTP = otp;
    user.verificationOTPExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    // Send OTP via email
    let emailSent = false;
    let generatedOTP = otp;
    try {
      emailSent = await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error("Email sending error:", emailError.message);
    }

    if (emailSent) {
      res.status(200).json({
        message: "OTP sent to your email for verification",
        pendingOTP: true,
        userId: user._id
      });
    } else {
      res.status(200).json({
        message: "OTP sent to your email for verification",
        pendingOTP: true,
        userId: user._id
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Verify Login OTP - Step 2
router.post("/verify-login-otp", async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ message: "Customer ID and OTP are required" });
    }

    const user = await Customer.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Customer not found" });
    }

    if (user.verificationOTP !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > user.verificationOTPExpiry) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Clear OTP
    user.verificationOTP = undefined;
    user.verificationOTPExpiry = undefined;
    await user.save();

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ==================== PASSWORD RESET ====================

// Request Password Reset (Send OTP)
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Please provide email" });
    }

    const emailLower = email.toLowerCase();
    
    // First check Customer collection
    let user = await Customer.findOne({ email: emailLower });
    let userType = "customer";
    
    // If not customer, check Employee collection
    if (!user) {
      const Employee = require("../models/Employee");
      user = await Employee.findOne({ email: emailLower });
      userType = "employee";
    }
    
    // If not employee, check Admin collection
    if (!user) {
      const Admin = require("../models/Admin");
      user = await Admin.findOne({ email: emailLower });
      userType = "admin";
    }

    if (!user) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiry (15 minutes)
    user.resetOTP = otp;
    user.resetOTPExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // Send OTP via email
    let emailSent = false;
    let generatedOTP = otp;
    try {
      emailSent = await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error("Email sending error:", emailError.message);
    }
    
    if (emailSent) {
      res.json({ 
        message: "OTP sent to your email",
        emailSent: true,
        userType
      });
    } else {
      res.json({ 
        message: "OTP sent (email failed - using fallback)",
        otp: generatedOTP,
        emailSent: false,
        userType
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Please provide email and OTP" });
    }

    const emailLower = email.toLowerCase();
    
    // Check all collections
    let user = await Customer.findOne({ email: emailLower });
    let userType = "customer";
    
    if (!user) {
      const Employee = require("../models/Employee");
      user = await Employee.findOne({ email: emailLower });
      userType = "employee";
    }
    
    if (!user) {
      const Admin = require("../models/Admin");
      user = await Admin.findOne({ email: emailLower });
      userType = "admin";
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.resetOTP !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > user.resetOTPExpiry) {
      return res.status(400).json({ message: "OTP expired" });
    }

    res.json({ message: "OTP verified successfully", userType });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    const emailLower = email.toLowerCase();
    
    // Check all collections
    let user = await Customer.findOne({ email: emailLower });
    let userType = "customer";
    
    if (!user) {
      const Employee = require("../models/Employee");
      user = await Employee.findOne({ email: emailLower });
      userType = "employee";
    }
    
    if (!user) {
      const Admin = require("../models/Admin");
      user = await Admin.findOne({ email: emailLower });
      userType = "admin";
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.resetOTP !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > user.resetOTPExpiry) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // Update password
    user.password = newPassword;
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successfully", userType });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Change Password (logged in user)
router.post("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Please provide current and new password" });
    }

    const user = await Customer.findById(req.userId);
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    // Invalidate all existing tokens (force re-login)
    // For simplicity, just return success
    
    await Notification.create({
      user: req.userId,
      type: "security",
      title: "Password Changed",
      message: "Your password has been changed successfully.",
      priority: "high"
    });

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get current user
router.get("/me", auth, async (req, res) => {
  try {
    const user = await Customer.findById(req.userId).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update profile
router.put("/profile", auth, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    delete updates.email;

    const user = await Customer.findByIdAndUpdate(req.userId, updates, { new: true }).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
