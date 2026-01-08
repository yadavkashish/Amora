// server.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// ---------------- ROUTE IMPORTS ----------------
const compatibilityRoutes = require("./routes/compatibility");
const personalityRoutes = require("./routes/personalityReport");
const userRoutes = require('./routes/users');
const profileRoutes = require('./routes/profile');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const chatRoutes = require('./routes/chat');
const paymentRoutes = require('./routes/payment');

// ---------------- APP SETUP ----------------
const app = express();
const server = http.createServer(app);

// ---------------- SOCKET.IO SETUP ----------------
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://amorateams.netlify.app',
      'https://www.amoraonline.in',
    ],
    credentials: true,
  },
});

app.set("trust proxy", 1);
app.set("io", io);

io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('send-message', (message) => {
    socket.to(message.receiverId).emit('receive-message', message);
  });

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });
});

// ---------------- CORS + PREFLIGHT ----------------
const allowedOrigins = [
  'http://localhost:5173',
  'https://amorateams.netlify.app',
  'https://www.amoraonline.in',
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Expose-Headers", "Set-Cookie");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// ---------------- MIDDLEWARE ----------------
app.use(express.json());
app.use(cookieParser());

// ---------------- ROUTES ----------------
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/compatibility', compatibilityRoutes);
app.use('/api/personality', personalityRoutes);
app.use('/api/payment', paymentRoutes);

// ---------------- DATABASE + SERVER START ----------------
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ Connected to MongoDB');

    // 🔥 START WHATSAPP BOT (RUNS ONCE)
    require("./whatsapp/bot");

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });
