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
import deleteRouter from "./middleware/removeImage.js";
import videoRouter from "./routes/videoRoutes.js";
import { Server } from 'socket.io'; // Import Socket.IO
import http from 'http';
import emailRouter from "./routes/emailRoutes.js";

const app = express();
const port = 4000;

// Create HTTP server from the Express app
const server = http.createServer(app);

// Enable CORS for all routes
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174" , "http://localhost:5175"], // Update with your frontend URL
    credentials: true
}));


global.io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"], // Update with your frontend URL
        methods: ["GET", "POST"],
        credentials: true
    }
});



// global.io.on('connection', (socket) => {
//   console.log('A user connected:', socket.id);

//   // Lắng nghe event từ client
//   socket.on('test-message', (data) => {
//       console.log('Received test message from client:', data);
//       // Phản hồi lại client
//       socket.emit('server-response', { message: 'Message received', data });
//   });

//   // Ngắt kết nối
//   socket.on('disconnect', () => {
//       console.log('A user disconnected:', socket.id);
//   });
// });




app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174" , "http://localhost:5175"] }));
app.use(express.json());


connectDB();

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
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error." });
});



app.get("/", (req, res) => {
  res.send("API WORKING");
});

server.listen(port, () => {
  console.log(`IO server started on http://localhost:${port}`);
});
