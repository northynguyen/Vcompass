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
import bookingRouter from "./routes/bookingRoutes.js";
import aiRoute from "./routes/aiRoutes.js";
import deleteRouter from "./middleware/removeImage.js";
import videoRouter from "./routes/videoRoutes.js";
import { Server } from 'socket.io'; // Import Socket.IO
import http from 'http';
import emailRouter from "./routes/emailRoutes.js";
import {googleCallback} from "./controllers/userController.js"
// Import setupScheduleSocket
import { setupScheduleSocket } from './socket/scheduleSocket.js';

const app = express();
const port = process.env.PORT || 4000;

// Create HTTP server from the Express app
const server = http.createServer(app);

// Enable CORS for all routes
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174" , "http://localhost:5175", "https://vcompass-partner.onrender.com","https://vcompass.onrender.com","https://vcompass-admin.onrender.com"], // Update with your frontend URL
    credentials: true
}));


global.io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175",, "https://vcompass-partner.onrender.com","https://vcompass.onrender.com","https://vcompass-admin.onrender.com"], // Update with your frontend URL
        methods: ["GET", "POST"],
        credentials: true
    }
});



app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174" , "http://localhost:5175", "https://vcompass-partner.onrender.com","https://vcompass.onrender.com","https://vcompass-admin.onrender.com"] }));
app.use(express.json());


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
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error." });
});



app.get("/", (req, res) => {
  res.send("API WORKING");
});

// Thiết lập Socket.IO cho schedule
setupScheduleSocket(global.io);

server.listen(port, () => {
  console.log(`IO server started on http://localhost:${port}`);
});
