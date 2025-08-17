const express = require("express");
const mongoose = require("mongoose");
const Users = require("../models/usersModel");
const jwt = require("jsonwebtoken");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { authenticateToken, authorizeRoles } = require("../utils/auth");
require("dotenv").config();
router.get(
  "/usersAll",
  authenticateToken,
  authorizeRoles("Admin"),
  async (req, res) => {
    try {
      const users = await Users.find();
      res.status(200).json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Create a new annotation
// routes/anotationRoute.js

router.post("/addUsers", async (req, res) => {
  const { name, email, password, userType, isActive } = req.body;

  try {
    // Check for existing email
    const existing = await Users.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ message: "A user with that email already exists." });
    }

    // Hash the password
    const hashed = await bcrypt.hash(password, 10);

    // Create and save the user (this triggers your pre('save') hook!)
    const user = new Users({
      name,
      email,
      password: hashed,
      userType,
      isActive,
    });
    await user.save();

    // Generate a token now that Annotator_ID exists
    const token = jwt.sign(
      {
        Annotator_ID: user.Annotator_ID,
        email: user.email,
        userType: user.userType,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Send back the new user and token
    res.status(201).json({ user, token });
  } catch (err) {
    console.error("POST /users error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Incorrect username" });
    }

    // Handle both boolean and string "false"
    if (user.isActive === false || user.isActive === "false") {
      return res.status(403).json({
        error: "Your account is deactivated. Please contact admin.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    const token = jwt.sign(
      {
        Annotator_ID: user.Annotator_ID,
        _id: user._id,
        email: user.email,
        userType: user.userType,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      createdAt: user.createdAt,
    };

    res.status(200).json({ token, user: userData });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});



// GET /api/annotations/user/me
router.get("/user/me", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user by ID
    const user = await Users.findById(userId).select("-password"); // exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch your profile" });
  }
});

router.post("/change-password", authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    return res.status(400).json({ error: "All fields are required" });

  try {
    const user = await Users.findOne({ Annotator_ID: req.user.Annotator_ID });

    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(401).json({ error: "Current password is incorrect" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update an users by ID
router.put("/UpdateUsers/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  const { name, email, userType, isActive, password } = req.body;

  try {
    const user = await Users.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (userType) user.userType = userType;
    if (typeof isActive !== "undefined") user.isActive = isActive;

    // ✅ Only hash & update password if provided
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    console.error("PUT /UpdateUsers/:id error:", err);
    res.status(500).json({ message: "Error updating user" });
  }
});


module.exports = router;
