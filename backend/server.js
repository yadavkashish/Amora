const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Route imports
const compatibilityRoutes = require("./routes/compatibility");
const userRoutes = require('./routes/users');
const profileRoutes = require('./routes/profile');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const chatRoutes = require('./routes/chat');

const app = express();
const server = http.createServer(app);

// ✅ Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'https://amorateams.netlify.app'
    ],
    credentials: true
  }
});
app.set("io", io);

io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  // Join private room (userId)
  socket.on('join-room', (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined room`);
  });

  // Handle send-message
  socket.on('send-message', (message) => {
    // Send to receiver
    io.to(message.receiver.toString()).emit('newMessage', message);

    // Send to sender (so sender UI updates immediately)
    io.to(message.sender.toString()).emit('newMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });
});

// ✅ Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://amorateams.netlify.app'
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// ✅ Routes
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chat', chatRoutes);
app.use("/api/compatibility", compatibilityRoutes);

// ✅ MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
});
