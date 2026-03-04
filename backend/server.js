// ---------------- SERVER SETUP ----------------
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

// ---------------- ROUTES ----------------
const compatibilityRoutes = require("./routes/compatibility");
const personalityRoutes = require("./routes/personalityReport");
const userRoutes = require("./routes/users");
const profileRoutes = require("./routes/profile");
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const notificationRoutes = require("./routes/notifications");
const paymentRoutes = require("./routes/payment");

// ---------------- APP INIT ----------------
const app = express();
const server = http.createServer(app);

app.set("trust proxy", 1);

// ---------------- SECURITY ----------------
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// ---------------- RESPONSE COMPRESSION ----------------
app.use(compression());

// ---------------- RATE LIMITING ----------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: "Too many requests. Please try again later.",
});

app.use("/api", limiter);

// ---------------- HEALTH CHECK ----------------
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

// ---------------- ALLOWED ORIGINS ----------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://amorateams.netlify.app",
  "https://amoraonline.in",
  "https://www.amoraonline.in",
];

// ---------------- CORS ----------------
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn("Blocked CORS:", origin);
      callback(new Error("CORS not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

// ---------------- BODY PARSERS ----------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ---------------- SOCKET.IO ----------------
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

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
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/compatibility", compatibilityRoutes);
app.use("/api/personality", personalityRoutes);
app.use("/api/payment", paymentRoutes);

// Upload routes
app.use("/api", require("./src/routes/uploads"));

// ---------------- GLOBAL ERROR HANDLER ----------------
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);

  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

// ---------------- DATABASE + SERVER ----------------
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI, {
    autoIndex: true,
    maxPoolSize: 10,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");

    // optional whatsapp bot
    if (process.env.ENABLE_WHATSAPP_BOT === "true") {
      const initBot = require("./whatsapp/bot");
      initBot();
    }

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });