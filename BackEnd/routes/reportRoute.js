const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRoles } = require("../utils/auth");
const Annotation = require("../models/annotationModel");
const Dataset = require("../models/DatasetModel");
const User = require("../models/usersModel");

// 📊 Generate full report
router.get("/", authenticateToken, authorizeRoles("Admin"), async (req, res) => {
  try {
    // ==== 1) Overall Annotation Stats ====
    const totalAnnotations = await Annotation.countDocuments();
    const completed = await Annotation.countDocuments({
      reviewed: true,
      Skipped: false,
    });
    const skipped = await Annotation.countDocuments({ Skipped: true });
    const pending = totalAnnotations - (completed + skipped);

    // Average score
    const avgScoreAgg = await Annotation.aggregate([
      { $group: { _id: null, avgScore: { $avg: "$Score" } } },
    ]);
    const avgScore = avgScoreAgg[0]?.avgScore || 0;

    // Errors summary
    const errorAgg = await Annotation.aggregate([
      {
        $group: {
          _id: null,
          Omission: { $sum: "$Omission" },
          Addition: { $sum: "$Addition" },
          Mistranslation: { $sum: "$Mistranslation" },
          Untranslation: { $sum: "$Untranslation" },
          totalErrors: {
            $sum: {
              $add: ["$Omission", "$Addition", "$Mistranslation", "$Untranslation"],
            },
          },
        },
      },
    ]);
    const errorSummary = errorAgg[0] || {
      Omission: 0,
      Addition: 0,
      Mistranslation: 0,
      Untranslation: 0,
      totalErrors: 0,
    };

    // ==== 2) Annotations Per User (group by email) ====
    const perUserAgg = await Annotation.aggregate([
      {
        $group: {
          _id: "$Annotator_Email",
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$reviewed", true] }, { $eq: ["$Skipped", false] }] },
                1,
                0,
              ],
            },
          },
          skipped: { $sum: { $cond: [{ $eq: ["$Skipped", true] }, 1, 0] } },
          inProgress: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$reviewed", false] }, { $eq: ["$Skipped", false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $addFields: {
          pending: {
            $subtract: ["$total", { $add: ["$completed", "$skipped", "$inProgress"] }],
          },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const emails = perUserAgg.map((u) => u._id);
    const users = await User.find({ email: { $in: emails } }, "name email");
    const userMap = Object.fromEntries(users.map((u) => [u.email, u]));

    const perUser = perUserAgg.map((u) => ({
      email: u._id,
      name: userMap[u._id]?.name || "Unknown",
      total: u.total,
      completed: u.completed,
      skipped: u.skipped,
      pending: u.pending,
      inProgress: u.inProgress,
    }));

    // ==== 3) Dataset Progress ====
    const datasets = await Dataset.find().populate("assignedTo", "name email");
    const datasetSummary = datasets.map((ds) => ({
      id: ds._id,
      name: ds.name,
      status: ds.status,
      assignedTo: ds.assignedTo.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
      })),
    }));

    // ==== 4) Timeline Stats (last 7 days) ====
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 6);

    const perDay = await Annotation.aggregate([
      { $match: { createdAt: { $gte: last7Days } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const errorsPerDay = await Annotation.aggregate([
      { $match: { createdAt: { $gte: last7Days } } },
      {
        $project: {
          createdAt: 1,
          totalErrors: {
            $add: ["$Omission", "$Addition", "$Mistranslation", "$Untranslation"],
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          errors: { $sum: "$totalErrors" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // ✅ Send final report
    res.json({
      overview: { totalAnnotations, completed, skipped, pending, avgScore },
      errors: errorSummary,
      perUser,
      datasets: datasetSummary,
      timeline: { perDay, errorsPerDay },
    });
  } catch (err) {
    console.error("Report error:", err);
    res.status(500).json({ message: "Failed to generate report" });
  }
});

module.exports = router;
