// ====== routes/anotationRoute.js (Back‑End) ======
const express = require("express");

const mongoose = require("mongoose");
const Annotation = require("../models/annotationModel");
const router = express.Router();
const { Parser } = require("json2csv");
const ExcelJS = require("exceljs");
const { authenticateToken } = require("./auth");
const User = require("../models/usersModel");
router.get("/export", authenticateToken, async (req, res) => {
  try {
    const { format = "csv" } = req.query;
    
    const Annotator_Email = req.user.email;
    const annotations = await Annotation.find();

    if (!annotations || annotations.length === 0) {
      return res.status(400).json({ message: "No data to export" });
    }

    if (format === "csv") {
      const fields = [
        "Annotator_ID",
        "Annotator_Email",
        "Annotation_ID",
        "Comment",
        "Src_lang",
        "Target_lang",
        "Score",
        "Omission",
        "Addition",
        "Mistranslation",
        "Untranslation",
        "Src_Issue",
        "Target_Issue",
      ];
      const parser = new Parser({ fields });
      const csv = parser.parse(annotations);

      res.header("Content-Type", "text/csv");
      res.attachment("annotations.csv");
      return res.send(csv);
    }

    if (format === "xlsx") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Annotations");
      worksheet.columns = [
        { header: "Annotator_ID", key: "Annotator_ID", width: 15 },
        { header: "Annotator_Email", key: "Annotator_Email", width: 15 },
        { header: "Annotation_ID", key: "Annotation_ID", width: 15 },
        { header: "Comment", key: "Comment", width: 30 },
        { header: "Src_lang", key: "Src_lang", width: 100 },
        { header: "Target_lang", key: "Target_lang", width: 100 },
        { header: "Score", key: "Score", width: 10 },
        { header: "Omission", key: "Omission", width: 10 },
        { header: "Addition", key: "Addition", width: 10 },
        { header: "Mistranslation", key: "Mistranslation", width: 10 },
        { header: "Untranslation", key: "Untranslation", width: 10 },
        { header: "Src_Issue", key: "Src_Issue", width: 100 },
        { header: "Target_Issue", key: "Target_Issue", width: 100 },
      ];

      worksheet.addRows(
        annotations.map((a) => a.toObject(), Annotator_Email)
      );

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=annotations.xlsx"
      );

      await workbook.xlsx.write(res);
      return res.end();
    }

    if (format === "json") {
      res.header("Content-Type", "application/json");
      res.attachment("annotations.json");
      return res.send(JSON.stringify(annotations, null, 2));
    }

    res.status(400).json({ message: "Unsupported format" });
  } catch (err) {
    console.error("Export error:", err);
    res.status(500).json({ message: "Failed to export data" });
  }
});

// Get all annotations
router.get("/Allannotation", authenticateToken, async (req, res) => {
  try {
    console.log("🧪 Decoded user:", req.user); // <-- SEE what it contains
    const userId = req.user.Annotator_ID || req.user.userId || req.user.id;
    const annotations = await Annotation.find({ Annotator_ID: userId });
    res.status(200).json(annotations);
  } catch (err) {
    console.error("GET /Allannotation error:", err);
    res.status(500).json({ message: err.message });
  }
});
router.get("/pending", authenticateToken, async (req, res) => {
  try {
    const annotatorId = req.user.Annotator_ID;

    const pendingCount = await Annotation.countDocuments({
      reviewed: false,
      Annotator_ID: annotatorId,
    });

    res.status(200).json({ count: pendingCount });
  } catch (err) {
    console.error("Error getting pending reviews:", err);
    res.status(500).json({ message: "Failed to get pending reviews" });
  }
});
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const totalAnnotations = await Annotation.countDocuments();
    const userCount = await User.countDocuments();
    const annotationsPerUser = userCount
      ? Math.round(totalAnnotations / userCount)
      : 0;

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 6);

    const annotationsByDay = await Annotation.aggregate([
      {
        $match: {
          createdAt: { $gte: last7Days },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }, // ✅ FIXED
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const errorByDay = await Annotation.aggregate([
      {
        $match: {
          createdAt: { $gte: last7Days },
        },
      },
      {
        $project: {
          createdAt: 1,
          totalErrors: {
            $add: [
              "$Omission",
              "$Addition",
              "$Mistranslation",
              "$Untranslation",
            ],
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }, // ✅ FIXED
          },
          value: { $sum: "$totalErrors" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalAnnotations,
      annotationsPerUser,
      annotationsByDay,
      errorByDay,
    });
  } catch (error) {
    console.error("Error in dashboard stats:", error);
    res.status(500).json({ message: "Failed to load dashboard data." });
  }
});

router.get("/mycount", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.Annotator_ID || req.user.userId || req.user.id;
    const total = await Annotation.countDocuments({ Annotator_ID: userId });
    res.status(200).json({ total });
  } catch (err) {
    console.error("GET /mycount error:", err);
    res.status(500).json({ message: "Failed to count your annotations" });
  }
});
router.get('/assigned/:annotatorId', async (req, res) => {
  const { annotatorId } = req.params;

  try {
    const annotations = await Annotation.find({ Annotator_ID: annotatorId });

    const formatted = annotations.map(a => ({
      id: a.Annotation_ID || a._id,
      source: a.Src_Text,
      due: a.createdAt?.toISOString().split('T')[0] || 'N/A',
      status: a.Skipped ? 'Skipped' : a.reviewed ? 'Completed' : 'In Progress'
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch assigned texts' });
  }
});

// Create a new annotation
// routes/anotationRoute.js

router.post("/Addannotation", authenticateToken, async (req, res) => {
  try {
    const {
      Comment,
      Src_Text,
      Src_lang,
      Target_lang,
      Score,
      Omission,
      Addition,
      Mistranslation,
      Untranslation,
      Src_Issue,
      Target_Issue,
      Annotation_ID
    } = req.body;

    const userId = req.user.Annotator_ID; // From token
    const userEmail = req.user.email; // Include email in your JWT at login

    // Check for duplicates
    const existing = await Annotation.findOne({
      Annotator_ID: userId,
      Annotation_ID
    });

    if (existing) {
      return res
        .status(409)
        .json({ message: "Annotation already exists for this text and user" });
    }

    const newAnnotation = new Annotation({
      Annotator_ID: userId,
      Annotator_Email: userEmail,
      Src_Text,
      Src_lang,
      Target_lang,
      Comment,
      Score,
      Omission,
      Addition,
      Mistranslation,
      Untranslation,
      Src_Issue,
      Target_Issue,
    });

    await newAnnotation.save();
    res.status(201).json(newAnnotation);
  } catch (err) {
    console.error("POST /rebortAnnotation error:", err);
    res.status(500).json({ message: err.message });
  }
});
// Skip annotation
router.post("/skip", authenticateToken, async (req, res) => {
  const { Src_Text } = req.body;
  const Annotator_ID = req.user.Annotator_ID;
  const Annotator_Email = req.user.email;

  if (!Src_Text || !Annotator_ID) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    let annotation = await Annotation.findOne({ Annotator_ID, Src_Text });

    if (annotation) {
      annotation.Skipped = true;
      await annotation.save();
    } else {
      annotation = new Annotation({
        Annotator_ID,
        Annotator_Email,
        Src_Text,
        Score: 0,
        Omission: 0,
        Addition: 0,
        Mistranslation: 0,
        Untranslation: 0,
        Src_Issue: "",
        Target_Issue: "",
        Skipped: true,
        reviewed: false,
      });
      await annotation.save();
    }

    res.status(200).json({ message: "Annotation marked as skipped" });
  } catch (err) {
    console.error("POST /skip error:", err);
    res.status(500).json({ message: "Failed to skip annotation" });
  }
});


// Update an annotation by ID
router.put("/rebortAnnotation/:id", async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid annotation ID format" });
  }

  try {
    const annotation = await Annotation.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!annotation)
      return res.status(404).json({ message: "Annotation not found" });
    res.status(200).json(annotation);
  } catch (err) {
    console.error("PUT /rebortAnnotation/:id error:", err);
    res.status(500).json({ message: err.message });
  }
});

// Delete an annotation by ID
router.delete(
  "/rebortAnnotationDelete/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const annotation = await Annotation.findById(req.params.id);

      if (!annotation)
        return res.status(404).json({ message: "Annotation not found" });

      // ✅ Optional: Ensure only owner can delete
      if (annotation.Annotator_ID !== req.user.Annotator_ID) {
        return res
          .status(403)
          .json({ message: "Unauthorized: Not your annotation" });
      }

      const deleted = await Annotation.findByIdAndDelete(req.params.id);
      res.status(200).json(deleted);
    } catch (err) {
      console.error("DELETE /rebortAnnotation/:id error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

// DELETE all annotations
router.delete("/deleteAll", async (req, res) => {
  try {
    await Annotation.deleteMany({});
    res.status(200).json({ message: "All annotations deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
