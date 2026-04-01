const jwt = require("jsonwebtoken");
const Customer = require("../models/Customer");
const Employee = require("../models/Employee");
const Admin = require("../models/Admin");

const JWT_SECRET = process.env.JWT_SECRET || "horizon-bank-secret-key-2024";

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.type === "admin") {
      const admin = await Admin.findById(decoded.id).select("-password");
      if (!admin) {
        return res.status(401).json({ message: "Admin not found" });
      }
      req.user = admin;
      req.userId = admin._id;
      req.userRole = admin.role;
      req.isAdmin = true;
    } else if (decoded.type === "employee") {
      const employee = await Employee.findById(decoded.id).select("-password");
      if (!employee) {
        return res.status(401).json({ message: "Staff not found" });
      }
      req.user = employee;
      req.userId = employee._id;
      req.userRole = employee.role;
      req.isEmployee = true;
    } else {
      const user = await Customer.findById(decoded.userId).select("-password");
      if (!user) {
        return res.status(401).json({ message: "Customer not found" });
      }
      req.user = user;
      req.userId = user._id;
      req.userRole = decoded.role || user.role;
      req.isEmployee = false;
    }
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = auth;
