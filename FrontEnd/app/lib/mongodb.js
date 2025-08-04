import mongoose from 'mongoose';

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect("mongodb://localhost:27017/mydb");
};

export default connectDB;
