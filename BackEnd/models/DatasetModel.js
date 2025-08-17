// models/DatasetModel.js
const mongoose = require("mongoose");

const DatasetSchema = new mongoose.Schema(
  {
    Dataset_ID: { type: String, required: true }, // e.g., UUID or generated
    english: { type: String, default: "" },
    somali: { type: String, default: "" },

    // allow many users per row/file
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],

    // links
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
    fileName: { type: String, required: true },

    status: { type: String, enum: ["pending", "in_progress", "done"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Dataset || mongoose.model("Dataset", DatasetSchema);
