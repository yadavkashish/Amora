const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
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
    origin: 'http://localhost:5173',
    credentials: true
  }
});
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

// ✅ Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());


// ✅ Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


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
