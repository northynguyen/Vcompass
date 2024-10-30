import cors from "cors";
import express from "express";
import { connectDB } from "./config/connectDB.js";
import { notificationRoutes } from "./routes/notificationRoutes.js";



import "dotenv/config";
import accommRoutes from "./routes/accommRoutes.js";
import { Attractionrouter } from "./routes/attractionRoutes.js";
import foodServiceRoutes from "./routes/foodServiceRoutes.js";
import scheduleRouter from "./routes/scheduleRoutes.js";
import userRoutes from "./routes/userRoute.js";

// App config
const app = express();
const port = process.env.PORT || 4000; // Lấy cổng từ biến môi trường hoặc mặc định là 4000

// Middleware
app.use(cors());
app.use(express.json());

// DB connection
connectDB();

// API routes
app.get("/", (req, res) => {
  res.send("API WORKING");
});

// Register routes
app.use("/images", express.static("uploads"));
app.use("/api/user", userRoutes);
app.use("/api/notifications", notificationRoutes); // Thêm route cho notification
app.use("/api/accommodations", accommRoutes);
app.use("/api/foodservices", foodServiceRoutes);
app.use("/api/schedule", scheduleRouter);

app.use("/api/attractions", Attractionrouter);
// app.use("/api/partners", userRoutes);
// app.use("/api/user/update", userRoutes);
// app.use("/api/partner/update", userRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error." });
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
