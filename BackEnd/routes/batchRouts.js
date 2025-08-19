// routes/batchRoutes.js
const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  uploadMultiple,
  assignBatch,
  annotatorsList,
  assignedByFile,
  unassignBatch
} = require("../controller/batchController");

const { authenticateToken, authorizeRoles } = require("../utils/auth");

// Upload many files (csv + xlsx)
router.post(
  "/upload-multiple",
  authenticateToken,
  authorizeRoles("Admin"),
  upload.array("files", 20),
  uploadMultiple
);

// Assign users to files (many-to-many)
router.post("/assign", authenticateToken, authorizeRoles("Admin"), assignBatch);

// Annotators list
router.get("/annotators", authenticateToken, authorizeRoles("Admin"), annotatorsList);

// Assigned map by file
router.get("/assigned/:batchId", authenticateToken, authorizeRoles("Admin"), assignedByFile);
// Unassign users from files (Admin only)
router.post("/unassign", authenticateToken, authorizeRoles("Admin"), unassignBatch);

module.exports = router;
