// ---------------- SERVER SETUP ----------------
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const cors = require("cors");

// ---------------- ROUTES ----------------
const compatibilityRoutes = require("./routes/compatibility");
const personalityRoutes = require("./routes/personalityReport");
const userRoutes = require("./routes/users");
const profileRoutes = require("./routes/profile");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const chatRoutes = require("./routes/chat");
const notificationRoutes = require("./routes/notifications");
const paymentRoutes = require("./routes/payment");

// ---------------- APP INIT ----------------
const app = express();
const server = http.createServer(app);

// Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://amorateams.netlify.app",
  "https://www.amoraonline.in",
];

// ---------------- GLOBAL CORS HEADERS (MUST BE FIRST!) ----------------
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Cookie",
  );
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ---------------- CORS MIDDLEWARE ----------------
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// ---------------- BODY PARSERS ----------------
app.use(express.json());
app.use(cookieParser());

// ---------------- SOCKET.IO ----------------
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.set("trust proxy", 1);
app.set("io", io);

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("join-room", (userId) => {
    socket.join(String(userId));
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// ---------------- ROUTES ----------------
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/auth", authRoutes);
// app.use("/api/messages", messageRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/compatibility", compatibilityRoutes);
app.use("/api/personality", personalityRoutes);
app.use("/api/payment", paymentRoutes);

// ---------------- MONGO + SERVER START ----------------
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");

    // Start WhatsApp Bot
    const initBot = require("./whatsapp/bot");
    initBot();

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
