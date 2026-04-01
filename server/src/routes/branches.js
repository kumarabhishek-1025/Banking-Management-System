const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const Branch = require("../models/Branch");

const router = express.Router();

// Get All Branches (Public)
router.get("/", async (req, res) => {
  try {
    const { city, state, isActive } = req.query;
    const query = { isActive: true };
    if (city) query["address.city"] = new RegExp(city, "i");
    if (state) query["address.state"] = new RegExp(state, "i");
    if (isActive !== undefined) query.isActive = isActive === "true";

    const branches = await Branch.find(query).sort({ "address.city": 1 });
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Branch by ID
router.get("/:id", async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) return res.status(404).json({ message: "Branch not found" });
    res.json(branch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Create Branch
router.post("/", auth, admin, async (req, res) => {
  try {
    const { branchName, branchType, address, contact, services, ifscCode, micrCode } = req.body;

    const branch = await Branch.create({
      branchName,
      branchType,
      address,
      contact,
      services,
      ifscCode,
      micrCode
    });

    res.status(201).json({ message: "Branch created successfully", branch });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Update Branch
router.patch("/:id", auth, admin, async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!branch) return res.status(404).json({ message: "Branch not found" });
    res.json({ message: "Branch updated successfully", branch });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Delete/Deactivate Branch
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!branch) return res.status(404).json({ message: "Branch not found" });
    res.json({ message: "Branch deactivated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Branches by City
router.get("/city/:city", async (req, res) => {
  try {
    const branches = await Branch.find({ 
      "address.city": new RegExp(req.params.city, "i"),
      isActive: true 
    });
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
