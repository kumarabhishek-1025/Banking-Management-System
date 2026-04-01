const admin = (req, res, next) => {
  const role = req.userRole || req.user?.role;
  if (role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin rights required." });
  }
};

module.exports = admin;
