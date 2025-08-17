const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRoles } = require("../utils/auth");
const Dataset = require("../models/DatasetModel");

// ✅ Get all datasets for Admin (optional filtering)
router.get("/", authenticateToken, authorizeRoles("Admin"), async (req, res) => {
  try {
    const datasets = await Dataset.find().populate("assignedTo", "name email");
    res.status(200).json(datasets);
  } catch (error) {
    console.error("Error fetching datasets:", error);
    res.status(500).json({ message: "Error fetching datasets" });
  }
});

// ✅ Get datasets assigned to logged-in user (Annotator)
router.get("/my", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const datasets = await Dataset.find({ assignedTo: userId }).populate("batch", "name");
    res.status(200).json(datasets);
  } catch (error) {
    console.error("Error fetching user datasets:", error);
    res.status(500).json({ message: "Error fetching user datasets" });
  }
});
// GET all datasets (Admin) or only assigned ones (Annotator)
router.get("/all", authenticateToken, async (req, res) => {
  try {
    let datasets;

    if (req.user.userType === "Admin") {
      // Admin gets all datasets
      datasets = await Dataset.find().populate("assignedTo", "name email");
    } else {
      const userId = req.user._id;
      datasets = await Dataset.find({ assignedTo: userId }).populate("batch", "name");
    }

    res.status(200).json(datasets);
  } catch (error) {
    console.error("Error fetching datasets:", error);
    res.status(500).json({ message: "Error fetching datasets" });
  }
});



// ✅ Update dataset status (Annotator updates progress)
router.patch("/:id/status", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["pending", "in_progress", "done"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const dataset = await Dataset.findById(req.params.id);
    if (!dataset) return res.status(404).json({ message: "Dataset not found" });

    // Only assigned user OR Admin can update
    if (
      !dataset.assignedTo.some((id) => id.toString() === req.user._id.toString()) &&
      req.user.userType !== "Admin"
    ) {
      return res.status(403).json({ message: "Not authorized to update this dataset" });
    }

    dataset.status = status;
    await dataset.save();
    res.status(200).json({ message: "Status updated", dataset });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Error updating dataset status" });
  }
});

// ✅ Get dataset by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.id).populate("assignedTo", "name email");
    if (!dataset) return res.status(404).json({ message: "Dataset not found" });

    // Annotator can only view if assigned
    if (
      !dataset.assignedTo.some((id) => id.toString() === req.user._id.toString()) &&
      req.user.userType !== "Admin"
    ) {
      return res.status(403).json({ message: "Not authorized to view this dataset" });
    }

    res.status(200).json(dataset);
  } catch (error) {
    console.error("Error fetching dataset:", error);
    res.status(500).json({ message: "Error fetching dataset" });
  }
});

module.exports = router;
