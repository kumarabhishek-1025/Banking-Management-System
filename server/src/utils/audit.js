const AuditLog = require("../models/AuditLog");

const createAuditLog = async (userId, action, details, ip) => {
  try {
    await AuditLog.create({
      user: userId,
      action,
      details,
      ip: ip || "unknown"
    });
  } catch (error) {
    console.error("Audit log error:", error);
  }
};

module.exports = { createAuditLog };
