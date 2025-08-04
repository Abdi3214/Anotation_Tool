const express     = require('express');
const router      = express.Router();
const Translation = require('../models/Translation');  // ← import model

// basic test
router.get('/', (req, res) => {
  res.send('📦 API route working');
});

// fetch all translations
router.get('/annotation', async (req, res) => {
  try {
    const docs = await Translation.find();     // ← use the model, not “translations”
    res.status(200).json(docs);
  } catch (err) {
    // now err.message will show real model/query errors
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
