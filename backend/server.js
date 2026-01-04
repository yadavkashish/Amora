// server.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Route imports
const compatibilityRoutes = require("./routes/compatibility");
const personalityRoutes = require("./routes/personalityReport");
const userRoutes = require('./routes/users');
const profileRoutes = require('./routes/profile');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const chatRoutes = require('./routes/chat');
const paymentRoutes = require('./routes/payment')

const app = express();
const server = http.createServer(app);

// ✅ Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173', // dev client (note: your earlier io allowed 5174 too; adjust if needed)
      'https://amorateams.netlify.app',
      'https://www.amoraonline.in',
      // add any other frontend origins here
    ],
    credentials: true
  }
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

// ------------------ CORS + preflight middleware ------------------
// Allowed origins for your app (adjust if you add domains)
const allowedOrigins = [
  'http://localhost:5173',
  'https://amorateams.netlify.app',
  'https://www.amoraonline.in',
  // add any other production/staging frontend domains here
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    // echo origin to allow credentials across domains
    res.header("Access-Control-Allow-Origin", origin);
  }
  // allowed methods
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  // allow necessary headers from client (Cookie required for some preflight checks)
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
  // allow credentials (cookies)
  res.header("Access-Control-Allow-Credentials", "true");
  // allow browser to read Set-Cookie header (usually not needed for cookies, but safe to expose other headers if required)
  res.header("Access-Control-Expose-Headers", "Set-Cookie");

  // handle preflight quickly
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
// ----------------------------------------------------------------

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chat', chatRoutes);
app.use("/api/compatibility", compatibilityRoutes);
app.use("/api/personality", personalityRoutes);
app.use('/api/payment' , paymentRoutes);
// Mongo + start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
});
