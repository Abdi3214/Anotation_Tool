const jwt = require("jsonwebtoken");
const User = require("../models/usersModel");

/**
 * Middleware to authenticate JWT token and attach user to req.
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token missing" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    const user = await User.findOne({ Annotator_ID: decoded.Annotator_ID });
    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error("Authentication error:", err);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};



/**
 * Middleware to allow only Admin users.
 */
const authenticateAdmin = (req, res, next) => {
  if (req.user?.userType === "Admin") return next();
  return res.status(403).json({ message: "Admins only" });
};

/**
 * Middleware for role-based authorization.
 * Usage: authorizeRoles('Admin', 'Manager')
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (!allowedRoles.includes(req.user.userType)) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
};

module.exports = { authenticateToken, authenticateAdmin, authorizeRoles };
