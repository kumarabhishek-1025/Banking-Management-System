const express = require("express");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const KYC = require("../models/KYC");
const Notification = require("../models/Notification");

const router = express.Router();

// Start KYC Process (Customer)
router.post("/start", auth, async (req, res) => {
  try {
    let kyc = await KYC.findOne({ user: req.userId });

    if (kyc && kyc.status === "verified") {
      return res.status(400).json({ message: "KYC already verified" });
    }

    if (kyc) {
      kyc.status = "pending";
    } else {
      kyc = new KYC({
        user: req.userId,
        status: "not_started"
      });
    }

    await kyc.save();
    res.json({ message: "KYC process started", kyc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit KYC Details (Customer)
router.post("/submit", auth, async (req, res) => {
  try {
    let kyc = await KYC.findOne({ user: req.userId });

    if (!kyc) {
      kyc = new KYC({ user: req.userId });
    }

    const { fullName, dateOfBirth, gender, maritalStatus, address, documents } = req.body;

    if (fullName) kyc.fullName = fullName;
    if (dateOfBirth) kyc.dateOfBirth = dateOfBirth;
    if (gender) kyc.gender = gender;
    if (maritalStatus) kyc.maritalStatus = maritalStatus;
    if (address) kyc.address = address;
    if (documents) {
      if (documents.aadhar) kyc.documents.aadhar = { ...kyc.documents.aadhar, ...documents.aadhar };
      if (documents.pan) kyc.documents.pan = { ...kyc.documents.pan, ...documents.pan };
      if (documents.passport) kyc.documents.passport = { ...kyc.documents.passport, ...documents.passport };
    }

    // Calculate verification level
    let level = 0;
    if (kyc.documents.aadhar?.number) level++;
    if (kyc.documents.pan?.number) level++;
    if (kyc.documents.passport?.number) level++;
    if (kyc.address?.present?.street) level++;
    if (kyc.selfieImage) level++;

    kyc.verificationLevel = level;
    kyc.status = "pending";
    kyc.submittedAt = new Date();

    await kyc.save();

    await Notification.create({
      user: req.userId,
      type: "system",
      title: "KYC Submitted",
      message: "Your KYC documents have been submitted for verification",
      priority: "medium"
    });

    res.json({ message: "KYC submitted successfully", kyc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get My KYC Status (Customer)
router.get("/status", auth, async (req, res) => {
  try {
    const kyc = await KYC.findOne({ user: req.userId });
    if (!kyc) {
      return res.json({ status: "not_started", verificationLevel: 0 });
    }
    res.json(kyc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Get All KYC Applications
router.get("/admin/all", auth, admin, async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const kycs = await KYC.find(query)
      .populate("user", "firstName lastName email")
      .populate("verifiedBy", "firstName lastName")
      .sort({ submittedAt: -1 });
    res.json(kycs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Review KYC
router.post("/admin/:id/review", auth, admin, async (req, res) => {
  try {
    const { status, rejectionReason, riskCategory } = req.body;
    const kyc = await KYC.findById(req.params.id);

    if (!kyc) return res.status(404).json({ message: "KYC not found" });

    if (kyc.status === "verified") {
      return res.status(400).json({ message: "KYC already verified" });
    }

    kyc.status = status;
    kyc.isVerified = status === "verified";
    kyc.verifiedBy = req.userId;
    kyc.verifiedAt = new Date();
    kyc.riskCategory = riskCategory || kyc.riskCategory;

    if (status === "rejected") {
      kyc.rejectionReason = rejectionReason;
    }

    await kyc.save();

    await Notification.create({
      user: kyc.user,
      type: "system",
      title: status === "verified" ? "KYC Verified" : "KYC Rejected",
      message: status === "verified" 
        ? "Your KYC has been verified successfully" 
        : `KYC rejected. Reason: ${rejectionReason}`,
      priority: "high"
    });

    res.json({ message: `KYC ${status}`, kyc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Verify Individual Document
router.post("/admin/:id/verify-document", auth, admin, async (req, res) => {
  try {
    const { documentType, verified } = req.body;
    const kyc = await KYC.findById(req.params.id);

    if (!kyc) return res.status(404).json({ message: "KYC not found" });

    const docType = documentType.toLowerCase();
    if (kyc.documents[docType]) {
      kyc.documents[docType].verified = verified;
    }

    let level = 0;
    if (kyc.documents.aadhar?.verified) level++;
    if (kyc.documents.pan?.verified) level++;
    if (kyc.documents.passport?.verified) level++;

    kyc.verificationLevel = level;
    await kyc.save();

    res.json({ message: "Document verification updated", kyc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
