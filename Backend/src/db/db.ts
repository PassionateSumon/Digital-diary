import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectDB = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`Connection: ${db.connection.host}`);
  } catch (error) {
    console.error("Error connecting to db: ", error);
    process.exit(1);
  }
};
