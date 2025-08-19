const express = require("express");
const mongoose = require("mongoose");
const Annotation = require("../models/annotationModel");
const router = express.Router();
const { Parser } = require("json2csv");
const ExcelJS = require("exceljs");
const { authenticateToken } = require("../utils/auth");

router.get("/export", authenticateToken, async (req, res) => {
  try {
    const { format = "csv", start, end } = req.query;

    // ---- NOTE: removed per-user email filter so this returns all annotations ----
    // If you need to restore per-user exports later, add:
    // query.Annotator_Email = req.user.email;
    let query = {};

    // keep date filtering if provided
    if (start && end) {
      query.createdAt = {
        $gte: new Date(`${start}T00:00:00`),
        $lte: new Date(`${end}T23:59:59`),
      };
    }

    // fetch annotations (all users unless date-filtered)
    const annotations = await Annotation.find(query);

    if (!annotations || annotations.length === 0) {
      return res.status(404).json({
        message: "No annotations found for the selected date range",
      });
    }

    // CSV export (same as your original)
    if (format.toLowerCase() === "csv") {
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

    // XLSX export
    if (format.toLowerCase() === "xlsx") {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Annotations");
      worksheet.columns = [
        { header: "Annotator_ID", key: "Annotator_ID", width: 15 },
        { header: "Annotator_Email", key: "Annotator_Email", width: 25 },
        { header: "Annotation_ID", key: "Annotation_ID", width: 20 },
        { header: "Comment", key: "Comment", width: 30 },
        { header: "Src_lang", key: "Src_lang", width: 50 },
        { header: "Target_lang", key: "Target_lang", width: 50 },
        { header: "Score", key: "Score", width: 10 },
        { header: "Omission", key: "Omission", width: 10 },
        { header: "Addition", key: "Addition", width: 10 },
        { header: "Mistranslation", key: "Mistranslation", width: 15 },
        { header: "Untranslation", key: "Untranslation", width: 15 },
        { header: "Src_Issue", key: "Src_Issue", width: 50 },
        { header: "Target_Issue", key: "Target_Issue", width: 50 },
      ];

      worksheet.addRows(annotations.map((a) => a.toObject()));

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

    // JSON export
    if (format.toLowerCase() === "json") {
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
    // <-- SEE what it contains
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
router.get("/Allassigned", authenticateToken, async (req, res) => {
  try {
    let annotations;
    const { annotatorId } = req.query;

    if (req.user.userType === "Admin") {
      annotations = annotatorId
        ? await Annotation.find({ Annotator_ID: parseInt(annotatorId) })
        : await Annotation.find({});
    } else {
      annotations = await Annotation.find({
        Annotator_ID: req.user.Annotator_ID,
      });
    }

    // Format for frontend
    const formatted = annotations.map((a) => ({
      _id: a._id,
      id: a.Annotation_ID,
      email: a.Annotator_Email,
      source: a.Src_Text,
      due: a.createdAt?.toISOString().split("T")[0] || "N/A",
      status: a.reviewed ? "Completed" : a.Skipped ? "Skipped" : "In Progress",
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch assigned annotations" });
  }
});

// router.post("/Addannotation", authenticateToken, async (req, res) => {
//   try {
//     const {
//       Annotation_ID,
//       Comment,
//       Src_Text,
//       Src_lang,
//       Target_lang,
//       Score,
//       Omission,
//       Addition,
//       Mistranslation,
//       Untranslation,
//       Src_Issue,
//       Target_Issue,
//     } = req.body;

//     const Annotator_ID = req.user.Annotator_ID; // from token
//     const Annotator_Email = req.user.email;

//     if (!Src_Text) {
//       return res.status(400).json({ message: "Src_Text is required" });
//     }

//     const updatedAnnotation = await Annotation.findOneAndUpdate(
//       { Annotator_ID, Src_Text }, // search by Annotator + text
//       {
//         $set: {
//           Annotation_ID: Annotation_ID || undefined, // keep existing or generate later
//           Annotator_Email,
//           Src_lang,
//           Target_lang,
//           Comment,
//           Score,
//           Omission,
//           Addition,
//           Mistranslation,
//           Untranslation,
//           Src_Issue,
//           Target_Issue,
//           reviewed: true,
//           Skipped: false,
//         },
//       },
//       {
//         new: true,  // return updated document
//         upsert: true, // insert if not exists
//       }
//     );

//     return res.status(200).json({
//       message: "Annotation saved successfully",
//       annotation: updatedAnnotation,
//     });
//   } catch (err) {
//     console.error("POST /Addannotation error:", err);
//     res.status(500).json({ message: err.message });
//   }
// });

router.post("/Addannotation", authenticateToken, async (req, res) => {
  try {
    const {
      Comment,
      Src_Text,
      Target_Text,
      Src_lang,
      Target_lang,
      Score,
      Omission,
      Addition,
      Mistranslation,
      Untranslation,
      Src_Issue,
      Target_Issue,
    } = req.body;

    const Annotator_ID = req.user.Annotator_ID;
    const Annotator_Email = req.user.email;

    if (!Src_Text || !Target_Text) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    //  First, check if an annotation already exists with same Annotator_ID and Src_Text
    let annotation = await Annotation.findOne({ Annotator_ID, Src_Text });

    if (annotation) {
      // Update existing annotation
      annotation.Target_Text = Target_Text;
      annotation.Src_lang = Src_lang;
      annotation.Target_lang = Target_lang;
      annotation.Comment = Comment;
      annotation.Score = Score;
      annotation.Omission = Omission;
      annotation.Addition = Addition;
      annotation.Mistranslation = Mistranslation;
      annotation.Untranslation = Untranslation;
      annotation.Src_Issue = Src_Issue;
      annotation.Target_Issue = Target_Issue;
      annotation.reviewed = true;
      annotation.Skipped = false;

      await annotation.save();

      return res.status(200).json({
        message: "Annotation updated",
        annotation,
      });
    }

    annotation = new Annotation({
      Annotator_ID,
      Annotator_Email,
      Src_Text,
      Target_Text,
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
      reviewed: true,
      Skipped: false,
    });

    await annotation.save();

    return res.status(201).json({
      message: "Annotation created",
      annotation,
    });
  } catch (err) {
    console.error("POST /Addannotation error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/skip", authenticateToken, async (req, res) => {
  try {
    const { Src_Text } = req.body;
    const Annotator_ID = req.user.Annotator_ID;
    const Annotator_Email = req.user.email;

    if (!Src_Text || !Annotator_ID) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Upsert annotation safely
    const annotation = await Annotation.findOneAndUpdate(
      { Annotator_ID, Src_Text }, // find by annotator and source text
      {
        $set: {
          Annotator_Email,
          reviewed: false,
          Skipped: true,
        },
        $setOnInsert: {
          // only applied if a new doc is inserted
          Annotation_ID: new mongoose.Types.ObjectId().toString(),
        },
      },
      {
        upsert: true, // insert if not found
        new: true, // return the updated/new document
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      message: "Annotation marked as skipped",
      annotation,
    });
  } catch (err) {
    console.error("POST /skip error:", err);
    res.status(500).json({ message: "Failed to skip annotation" });
  }
});

// Update an annotation by ID
router.put("/rebortAnnotation/:id", authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid annotation ID format" });
    }

    const {
      Skipped,
      Comment,
      Score,
      Omission,
      Addition,
      Mistranslation,
      Untranslation,
      Src_Issue,
      Target_Issue,
    } = req.body;

    const annotation = await Annotation.findById(id);
    if (!annotation) {
      return res.status(404).json({ message: "Annotation not found" });
    }

    // Update fields
    if (Skipped) {
      annotation.Skipped = true;
      annotation.reviewed = false;
    } else {
      annotation.Skipped = false;
      annotation.reviewed = true;
    }

    // Optional overwrite fields if provided
    if (Comment !== undefined) annotation.Comment = Comment;
    if (Score !== undefined) annotation.Score = Score;
    if (Omission !== undefined) annotation.Omission = Omission;
    if (Addition !== undefined) annotation.Addition = Addition;
    if (Mistranslation !== undefined)
      annotation.Mistranslation = Mistranslation;
    if (Untranslation !== undefined) annotation.Untranslation = Untranslation;
    if (Src_Issue !== undefined) annotation.Src_Issue = Src_Issue;
    if (Target_Issue !== undefined) annotation.Target_Issue = Target_Issue;

    await annotation.save();
    res.status(200).json(annotation);
  } catch (err) {
    console.error("PUT /rebortAnnotation/:id error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
