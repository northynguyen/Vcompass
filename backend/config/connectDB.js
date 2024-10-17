import { MongoClient, ServerApiVersion } from "mongodb";
import mongoose from "mongoose";


export const connectDB = async () => {
  const connectionString = process.env.MONGOOSE_URL; // or your specific connection string
    if (!connectionString) {
        throw new Error('MongoDB connection string is missing or undefined');
    }

  const client = new MongoClient(connectionString, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    await mongoose.connect(connectionString);
    console.log("DB connected");
  } catch (error) {
    console.error("DB connection failed", error);
  } finally {
    await client.close();
  }
};
