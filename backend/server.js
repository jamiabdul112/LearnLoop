import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from "./DB/connectionDB.js";
import authRoute from "./routes/auth.route.js";
import skillRoute from "./routes/skill.route.js";
import tradeRoute from "./routes/trade.route.js";
import chatRoute from "./routes/chat.routes.js";
import reviewRoute from './routes/review.route.js';
import { v2 as cloudinary } from "cloudinary";
import http from "http";              // ✅ new
import { initSocket } from "./utils/socket.js"; // ✅ your socket.js file
import path from "path";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY
});

const __dirname = path.resolve();

const app = express();

app.use(
    cors({
        origin: ["http://localhost:3000", "http://localhost:3001"],
        credentials: true,
    })
)

const server = http.createServer(app); // ✅ wrap express in http server

app.use(express.json({ limit: "5mb" })); 
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser()); 

// routes
app.use("/api/auth", authRoute);
app.use("/api/skills", skillRoute);
app.use("/api/trades", tradeRoute);
app.use("/api/chats", chatRoute);
app.use("/api/reviews", reviewRoute);

// socket.io init
initSocket(server); // ✅ hook socket.io into the same server


// If that still throws an error in Express 5, try:
// --- DEPLOYMENT SETTINGS ---
if (process.env.NODE_ENV === "production") {
    // Serve static files
    app.use(express.static(path.join(__dirname, "frontend", "build"))); 

    // Use the string pattern (.*) instead of the regex /.*/
    app.get( /.*/, (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
    });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});