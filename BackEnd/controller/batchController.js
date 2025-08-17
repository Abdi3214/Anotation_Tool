// controller/batchController.js
const Batch = require("../models/batch");
const Dataset = require("../models/DatasetModel");
const User = require("../models/usersModel");
const path = require("path");
const fs = require("fs");
const csv = require("csv-parser");
const xlsx = require("xlsx");

// Parse rows from a file (CSV/XLSX) and enforce two columns: english & somali
const readRows = async (absPath) => {
  const ext = path.extname(absPath).toLowerCase();
  const requiredHeaders = ["english", "somali"];

  if (ext === ".csv") {
    return new Promise((resolve, reject) => {
      const rows = [];
      let validated = false;

      fs.createReadStream(absPath)
        .pipe(csv())
        .on("headers", (headers) => {
          const lower = headers.map(h => h.toLowerCase().trim());
          if (
            lower.length !== requiredHeaders.length ||
            !requiredHeaders.every((h, i) => lower[i] === h)
          ) {
            return reject(
              new Error("CSV must contain exactly two headers: english, somali")
            );
          }
          validated = true;
        })
        .on("data", (row) => rows.push(row))
        .on("end", () => {
          if (!validated) return reject(new Error("CSV validation failed"));
          resolve(rows);
        })
        .on("error", reject);
    });
  }

  if (ext === ".xlsx") {
    const wb = xlsx.readFile(absPath);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    if (!rows.length) throw new Error("XLSX is empty");

    const headers = Object.keys(rows[0]).map(h => h.toLowerCase().trim());
    if (
      headers.length !== requiredHeaders.length ||
      !requiredHeaders.every((h, i) => headers[i] === h)
    ) {
      throw new Error("XLSX must contain exactly two headers: english, somali");
    }

    return rows;
  }

  throw new Error("Unsupported file format");
};

/**
 * POST /api/batches/upload-multiple
 * Body: multipart/form-data { batchName, files[] }
 */
const uploadMultiple = async (req, res) => {
  try {
    const { batchName } = req.body;
    const files = req.files || [];
    if (!batchName) return res.status(400).json({ error: "batchName is required" });
    if (!files.length) return res.status(400).json({ error: "No files uploaded" });

    const uploadedBy = req.user._id;

    // Create batch
    const batch = await Batch.create({
      batchName,
      uploadedBy,
      files: files.map(f => ({
        fileName: f.filename,
        ext: path.extname(f.originalname).toLowerCase(),
        uploadedAt: new Date(),
      })),
    });

    let totalRows = 0;
    for (const file of files) {
      const absPath = path.join(process.cwd(), "uploads", file.filename);
      const rows = await readRows(absPath);

      const docs = rows.length
        ? rows.map((r, i) => ({
            Dataset_ID: r.id || `${file.filename}#${i}`,
            english: r.english || "",
            somali: r.somali || "",
            batch: batch._id,
            fileName: file.filename,
          }))
        : [
            {
              Dataset_ID: `${file.filename}#0`,
              english: "",
              somali: "",
              batch: batch._id,
              fileName: file.filename,
            },
          ];

      totalRows += docs.length;
      await Dataset.insertMany(docs);
    }

    res.status(201).json({
      message: "Batch created & files uploaded",
      batchId: batch._id,
      files: batch.files.map(f => f.fileName),
      totalRows,
    });
  } catch (err) {
    console.error("uploadMultiple error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
};

/**
 * POST /api/batches/assign
 */
const assignBatch = async (req, res) => {
  try {
    const { batchId, assignments } = req.body;
    if (!batchId || !Array.isArray(assignments) || !assignments.length)
      return res.status(400).json({ error: "batchId and assignments are required" });

    const batch = await Batch.findById(batchId);
    if (!batch) return res.status(404).json({ error: "Batch not found" });

    let modified = 0;

    for (const a of assignments) {
      const { userId, fileNames } = a || {};
      if (!userId || !Array.isArray(fileNames) || !fileNames.length) continue;

      const user = await User.findById(userId);
      if (!user || user.isActive === false) continue;

      for (const fileName of fileNames) {
        const ids = (await Dataset.find({ batch: batchId, fileName }).select("_id")).map(d => d._id);
        if (!ids.length) continue;
        const result = await Dataset.updateMany({ _id: { $in: ids } }, { $addToSet: { assignedTo: userId } });
        modified += result.modifiedCount || 0;
      }
    }

    res.json({ message: "Assignment complete", modified });
  } catch (err) {
    console.error("assignBatch error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const annotatorsList = async (_req, res) => {
  try {
    const annotators = await User.find({ userType: "annotator", isActive: true })
      .select("_id name email")
      .sort({ name: 1 });
    res.json(annotators);
  } catch (err) {
    console.error("annotatorsList error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const assignedByFile = async (req, res) => {
  try {
    const { batchId } = req.params;
    const rows = await Dataset.find({ batch: batchId }).populate("assignedTo", "name email");

    const map = {};
    for (const ds of rows) {
      if (!map[ds.fileName]) map[ds.fileName] = [];
      for (const u of ds.assignedTo) {
        const exists = map[ds.fileName].some(x => String(x._id) === String(u._id));
        if (!exists) map[ds.fileName].push({ _id: u._id, name: u.name, email: u.email });
      }
    }
    res.json({ batchId, assignments: map });
  } catch (err) {
    console.error("assignedByFile error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  uploadMultiple,
  assignBatch,
  annotatorsList,
  assignedByFile,
};
