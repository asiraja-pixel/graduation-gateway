import mongoose from "mongoose";

const mongoUri = process.env.MONGODB_URI as string | undefined;

if (!mongoUri) {
  throw new Error("MONGODB_URI is not set in the environment");
}

export async function connectToDatabase() {
  try {
    await mongoose.connect(mongoUri as string);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error", error);
    throw error;
  }
}

export { mongoose };

