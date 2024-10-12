import cors from "cors";
import express from "express";
import { connectDB } from "./config/connectDB.js";
import { notificationRoutes } from "./routes/notificationRoutes.js";

//app config
const app = express();
const port = 4000;

//middlewares
app.use(express.json());
app.use(cors());

// db connection
connectDB();

//api endpoints

//api routes
app.get("/", (req, res) => {
  res.send("API WORKING");
});

app.use("/api", notificationRoutes);
//listen
app.listen(port, () =>
  console.log(`Server started on http://localhost:${port}`)
);
