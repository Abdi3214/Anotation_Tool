// 📁 routes/testRoute.js
const express = require("express");
const router = express.Router();
const { authenticateToken, authenticateAdmin } = require("../utils/auth");

// Test JWT authentication
router.get("/check", authenticateToken, (req, res) => {
  res.json({
    message: "JWT is valid!",
    user: req.user
  });
});

// Test admin access
router.get("/admin-check", authenticateToken, authenticateAdmin, (req, res) => {
  res.json({
    message: "Admin access granted!",
    user: req.user
  });
});

module.exports = router;
