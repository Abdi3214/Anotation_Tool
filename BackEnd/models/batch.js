// models/batch.js
const mongoose = require("mongoose");

const BatchSchema = new mongoose.Schema({
  batchName: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  files: [
    {
      fileName: { type: String, required: true }, // stored filename
      ext: { type: String },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Batch || mongoose.model("Batch", BatchSchema);
