const mongoose = require('mongoose');

const TranslationSchema = new mongoose.Schema({
  english:    { type: String, required: true },
  somali:     { type: String, required: true },
  // add other fields here…
}, { collection: 'translations' });

module.exports = mongoose.model('Translation', TranslationSchema);
