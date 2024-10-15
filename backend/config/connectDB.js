import { MongoClient, ServerApiVersion } from "mongodb";
import mongoose from "mongoose";
const uri =
  "mongodb+srv://thienlove161203:kB7MWvnptgsSLiE1@cluster0.phzg1.mongodb.net/VCompass";

export const connectDB = async () => {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    await mongoose.connect(uri);
    console.log("DB connected");
  } catch (error) {
    console.error("DB connection failed", error);
  } finally {
    await client.close();
  }
};
