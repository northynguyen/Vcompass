import cors from "cors";
import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io"; // Import Socket.IO
import { connectDB } from "./config/connectDB.js";
import { googleCallback } from "./controllers/userController.js";
import deleteRouter from "./middleware/removeImage.js";
import accommRoutes from "./routes/accommRoutes.js";
import aiRoute from "./routes/aiRoutes.js";
import { Attractionrouter } from "./routes/attractionRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import emailRouter from "./routes/emailRoutes.js";
import foodServiceRoutes from "./routes/foodServiceRoutes.js";
import { notificationRoutes } from "./routes/notificationRoutes.js";
import scheduleRouter from "./routes/scheduleRoutes.js";
import userRoutes from "./routes/userRoute.js";
import videoRouter from "./routes/videoRoutes.js";
import extensionRouter from "./routes/extensionRoutes.js";
import reportRouter from "./routes/reportRoutes.js";
import { setupScheduleSocket } from './socket/scheduleSocket.js';
import shortVideoRoutes from "./routes/ShortVideoRoutes.js";
import logActivityRouter from "./routes/logActivity.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Tạo __dirname cho ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

// Create HTTP server from the Express app
const server = http.createServer(app);

// Cấu hình CORS
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "https://vcompass-partner.onrender.com",
    "https://vcompass.onrender.com",
    "https://vcompass-admin.onrender.com",
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'token', 'Authorization']
}));

// Tăng giới hạn kích thước body
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

global.io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      ,
      "https://vcompass-partner.onrender.com",
      "https://vcompass.onrender.com",
      "https://vcompass-admin.onrender.com",
    ], // Update with your frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://vcompass-partner.onrender.com",
      "https://vcompass.onrender.com",
      "https://vcompass-admin.onrender.com",
    ],
  })
);

connectDB();
app.use("/auth/google/callback", googleCallback);
app.use("/images", express.static("uploads"));
app.use("/api/user", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/accommodations", accommRoutes);
app.use("/api/foodservices", foodServiceRoutes);
app.use("/api/schedule", scheduleRouter);
app.use("/api/deleteImage", deleteRouter);
app.use("/api/attractions", Attractionrouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/videos", videoRouter);
app.use("/api/email", emailRouter);
app.use("/api/ai", aiRoute);
app.use("/api/conversations", conversationRoutes);
app.use("/api/extensions", extensionRouter);
app.use("/api/reports", reportRouter);
app.use('/api/shortvideo', shortVideoRoutes);
app.use('/api/logs', logActivityRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error." });
});

app.get("/", (req, res) => {
  res.send("API WORKING");
});
setupScheduleSocket(global.io);
global.io.on("connection", (socket) => {
  console.log("🔵 User connected:", socket.id);

  // 🚀 Xử lý khi user vào phòng chat
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  // 💬 Xử lý tin nhắn chat
  socket.on("newMessage", (message) => {
    console.log("📩 New message:", message);
    io.to(message.conversationId).emit("newMessage", message);
  });
});
server.listen(port, () => {
  console.log(`IO server started on http://localhost:${port}`);
});

const uploadDirs = [
  path.join(__dirname, 'public', 'uploads'),
  path.join(__dirname, 'public', 'uploads', 'videos'),
  path.join(__dirname, 'public', 'uploads', 'thumbnails')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});
