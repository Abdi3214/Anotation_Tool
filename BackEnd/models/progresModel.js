const mongoose = require("mongoose");

const ProgressSchema = new mongoose.Schema({
  userId: { type: Number, required: true, unique: true },
  lastAnnotationIndex: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Progress", ProgressSchema);
