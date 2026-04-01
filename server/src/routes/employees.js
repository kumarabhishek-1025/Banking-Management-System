const express = require("express");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const Employee = require("../models/Employee");
const Admin = require("../models/Admin");
const AuditLog = require("../models/AuditLog");
const { sendOTPEmail } = require("../utils/email");

const router = express.Router();

// Debug route to check if user exists
router.get("/debug-lookup", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email query param required" });
    }
    
    const emailLower = email.toLowerCase();
    
    const adminUser = await Admin.findOne({ email: emailLower });
    const employeeUser = await Employee.findOne({ email: emailLower });
    
    res.json({
      searchedEmail: emailLower,
      foundInAdmin: adminUser ? { email: adminUser.email, role: adminUser.role } : null,
      foundInEmployee: employeeUser ? { email: employeeUser.email, role: employeeUser.role } : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Debug route to test login
router.post("/debug-login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailLower = email.toLowerCase();
    
    console.log("DEBUG LOGIN:", { email: emailLower, password });
    
    // Check Admin
    let user = await Admin.findOne({ email: emailLower });
    let userType = "admin";
    
    if (!user) {
      user = await Employee.findOne({ email: emailLower });
      userType = "employee";
    }
    
    if (!user) {
      return res.json({ found: false, message: "No user found" });
    }
    
    const isMatch = await user.comparePassword(password);
    
    res.json({
      found: true,
      userType,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      passwordMatch: isMatch
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const otpStore = new Map();

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const emailLower = email.toLowerCase();
    
    // Check Admin collection first
    let user = await Admin.findOne({ email: emailLower });
    let userType = "admin";
    
    // If not admin, check Employee collection
    if (!user) {
      user = await Employee.findOne({ email: emailLower });
      userType = "employee";
    }

    if (!user) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    const otp = generateOTP();
    otpStore.set(emailLower, { otp, expiresAt: Date.now() + 15 * 60 * 1000, userType });

    let emailSent = false;
    try {
      emailSent = await sendOTPEmail(email, otp);
    } catch (err) {
      console.error("Email sending error:", err.message);
    }

    if (emailSent) {
      res.json({ message: "OTP sent to your email" });
    } else {
      res.json({ message: "OTP sent (email failed - using fallback)", otp });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP and new password are required" });
    }

    const emailLower = email.toLowerCase();
    const stored = otpStore.get(emailLower);
    if (!stored) {
      return res.status(400).json({ message: "OTP expired or invalid" });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(emailLower);
      return res.status(400).json({ message: "OTP expired" });
    }

    // Check Admin collection first
    let user = await Admin.findOne({ email: emailLower });
    let userType = "admin";
    
    // If not admin, check Employee collection
    if (!user) {
      user = await Employee.findOne({ email: emailLower });
      userType = "employee";
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = newPassword;
    await user.save();

    otpStore.delete(emailLower);

    await AuditLog.create({
      employee: user._id,
      action: "reset_password",
      module: "auth",
      description: `Password reset for ${userType}: ${user.email}`,
      ipAddress: req.ip
    });

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Create Employee
router.post("/create", auth, admin, async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role, department, designation, salary } = req.body;

    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ message: "Employee already exists" });
    }

    const employee = await Employee.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      role: role || "clerk",
      department: department || "operations",
      designation,
      salary,
      createdBy: req.userId
    });

    await AuditLog.create({
      employee: req.userId,
      action: "create_employee",
      module: "admin",
      description: `Created employee: ${employee.firstName} ${employee.lastName}`,
      newData: { email: employee.email, role: employee.role },
      ipAddress: req.ip
    });

    res.status(201).json({ message: "Employee created successfully", employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get All Employees
router.get("/all", auth, admin, async (req, res) => {
  try {
    const { role, department, isActive } = req.query;
    const query = {};
    if (role) query.role = role;
    if (department) query.department = department;
    if (isActive !== undefined) query.isActive = isActive === "true";

    const employees = await Employee.find(query).sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get Employee by ID
router.get("/:id", auth, admin, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Update Employee
router.patch("/:id", auth, admin, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const previousData = employee.toObject();
    const allowedUpdates = ["firstName", "lastName", "phone", "role", "department", "designation", "salary", "isActive"];
    const changes = [];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (req.body[field] !== employee[field]) {
          changes.push({ field, oldValue: employee[field], newValue: req.body[field] });
        }
        employee[field] = req.body[field];
      }
    });

    await employee.save();

    await AuditLog.create({
      employee: req.userId,
      action: "update_employee",
      module: "admin",
      description: `Updated employee: ${employee.firstName} ${employee.lastName}`,
      previousData,
      newData: employee.toObject(),
      changes,
      ipAddress: req.ip
    });

    res.json({ message: "Employee updated successfully", employee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Delete/Deactivate Employee
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    employee.isActive = false;
    await employee.save();

    await AuditLog.create({
      employee: req.userId,
      action: "deactivate_employee",
      module: "admin",
      description: `Deactivated employee: ${employee.firstName} ${employee.lastName}`,
      ipAddress: req.ip
    });

    res.json({ message: "Employee deactivated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Employee Login (Handles both Admin and Staff)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const emailLower = email.toLowerCase();

    let user = await Admin.findOne({ email: emailLower });
    let userType = "admin";
    
    if (!user) {
      user = await Employee.findOne({ email: emailLower });
      userType = "employee";
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is deactivated" });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = require("jsonwebtoken").sign(
      { id: user._id, role: user.role, type: userType },
      process.env.JWT_SECRET || "horizon-bank-secret-key-2024",
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      [userType]: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
