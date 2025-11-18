
import mongoose from 'mongoose';


export default async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is missing");

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
    console.log("connectDB() called");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}
