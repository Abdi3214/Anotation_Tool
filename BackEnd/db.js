const mongoose = require('mongoose');
require("dotenv").config(); // <-- make sure this is here

const connectDB = async () => {
  try {
    console.log("MONGO_URL:", process.env.MONGO_URL); // 🔍 check if it's undefined
    const uri = process.env.MONGO_URL || "mongodb+srv://team60:XhCk9c5hUYeDuGRq@cluster0.gdru6.mongodb.net/mydb";
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
