// ---------------- SERVER SETUP ----------------
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");

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
app.use(helmet());
const server = http.createServer(app);

// ---------------- ALLOWED ORIGINS ----------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://amorateams.netlify.app",
  "https://amoraonline.in",
  "https://www.amoraonline.in",
];

// ---------------- CORS (FIXED) ----------------
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman, curl

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.options("*", cors());

// ---------------- BODY PARSERS ----------------
app.use(express.json({ limit: "1mb" }));
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
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/compatibility", compatibilityRoutes);
app.use("/api/personality", personalityRoutes);
app.use("/api/payment", paymentRoutes);

// ---------------- MONGO + SERVER START ----------------
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");

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
  });
