const express = require("express");
const Complaint = require("../models/Complaint");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");

const router = express.Router();

// Create complaint (Customer)
router.post("/", auth, async (req, res) => {
  try {
    const { category, subject, description, relatedAccount, relatedTransaction } = req.body;

    if (!category || !subject || !description) {
      return res.status(400).json({ message: "Category, subject, and description are required" });
    }

    const complaint = new Complaint({
      user: req.userId,
      category,
      subject,
      description,
      relatedAccount,
      relatedTransaction,
      status: "pending"
    });

    await complaint.save();

    await Notification.create({
      user: req.userId,
      type: "support",
      title: "Complaint Submitted",
      message: `Your complaint "${subject}" has been submitted. Ticket: ${complaint.ticketNumber}`,
      priority: "medium"
    });

    res.status(201).json({
      message: "Complaint submitted successfully",
      complaint: {
        id: complaint._id,
        ticketNumber: complaint.ticketNumber,
        subject,
        category,
        status: complaint.status,
        createdAt: complaint.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get my complaints (Customer)
router.get("/my", auth, async (req, res) => {
  try {
    const { status, category } = req.query;
    const query = { user: req.userId };
    
    if (status) query.status = status;
    if (category) query.category = category;

    const complaints = await Complaint.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ complaints });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get single complaint (Customer)
router.get("/:id", auth, async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({ complaint });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add response to complaint (Customer)
router.post("/:id/respond", auth, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const complaint = await Complaint.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.status === "resolved") {
      return res.status(400).json({ message: "Cannot respond to resolved complaint" });
    }

    complaint.responses.push({
      from: "customer",
      message,
      respondedAt: new Date()
    });

    complaint.status = "in_progress";
    await complaint.save();

    res.json({
      message: "Response added",
      complaint
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
