const express     = require('express');
const router      = express.Router();
const Translation = require('../models/Translation');  


router.get('/', (req, res) => {
  res.send('📦 API route working');
});


router.get('/annotation', async (req, res) => {
  try {
    const docs = await Translation.find();     
    res.status(200).json(docs);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
