// db.js
const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = async () => {
  try {
    mongoose.connect(process.env.Mongo_url)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB; 
