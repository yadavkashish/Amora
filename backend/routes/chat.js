const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth'); // ✅ import the middleware
const Chat = require('../models/Chat')
const mongoose = require('mongoose')
const Profile = require("../models/Profile");


// ✅ Apply protect middleware
router.use(protect);

// Get list of users you've chatted with + last message
router.get("/", async (req, res) => {
  const userId = req.user._id;

  try {
    // 1️⃣ Get chats
    const chats = await Chat.find({
      participants: userId,
      status: { $in: ["REQUESTED", "ACCEPTED"] }
    });

    // 2️⃣ Collect other user IDs
    const otherUserIds = chats.map(chat =>
      chat.participants.find(id => id.toString() !== userId.toString())
    );

    // 3️⃣ Fetch profiles + user names
    const profiles = await Profile.find({
      user: { $in: otherUserIds }
    }).populate("user", "name");

    // 4️⃣ Fetch last messages
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
      deletedFor: { $ne: userId }
    }).sort({ timestamp: -1 });

    const messageMap = {};
    messages.forEach(msg => {
      const other =
        msg.sender.toString() === userId.toString()
          ? msg.receiver.toString()
          : msg.sender.toString();

      if (!messageMap[other]) messageMap[other] = msg;
    });

    // 5️⃣ Build chat list
    const chatList = chats.map(chat => {
      const otherUserId = chat.participants.find(
        id => id.toString() !== userId.toString()
      );

      const profile = profiles.find(
        p => p.user._id.toString() === otherUserId.toString()
      );

      const lastMsg = messageMap[otherUserId.toString()];

      return {
        _id: otherUserId,
        name: profile?.user?.name || "Unknown",
        profilePic: profile?.profilePic || null, // ✅ FIXED
        chatId: chat._id,
        chatStatus: chat.status,
        initiatedBy: chat.initiatedBy,
        lastMessage: lastMsg?.content || "",
        timestamp: lastMsg?.timestamp || chat.createdAt,
        unreadCount: 0
      };
    });

    res.json(chatList);
  } catch (err) {
    console.error("❌ Chat list error:", err);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
});



// Get full chat with a user
router.get('/:otherUserId', async (req, res) => {
  const currentUserId = req.user._id;
  const otherUserId = req.params.otherUserId;

  try {
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.post("/request", async (req, res) => {
  console.log("📥 Chat request body:", req.body);
  console.log("👤 Sender:", req.user._id);

  const { receiverId } = req.body;

  if (!receiverId) {
    return res.status(400).json({ error: "receiverId missing" });
  }

  const existingChat = await Chat.findOne({
    participants: { $all: [req.user._id, receiverId] }
  });

  if (existingChat) {
    return res.status(400).json({
      error: "Chat already exists",
      chatId: existingChat._id,
      status: existingChat.status
    });
  }

  const chat = await Chat.create({
    participants: [req.user._id, receiverId],
    initiatedBy: req.user._id,
    status: "REQUESTED"
  });

  res.status(201).json({
    chatId: chat._id,
    status: chat.status
  });
});

// GET chat meta between current user & other user
router.get("/meta/:otherUserId", async (req, res) => {
  const currentUserId = req.user._id;
  const { otherUserId } = req.params;

  const chat = await Chat.findOne({
    participants: { $all: [currentUserId, otherUserId] }
  });

  if (!chat) {
    return res.json(null);
  }

  res.json({
    chatId: chat._id,
    status: chat.status,
    initiatedBy: chat.initiatedBy.toString(),
    blockedBy: chat.blockedBy?.toString() || null
  });
});


// Send a new message
router.post('/:receiverId', async (req, res) => {
  const currentUserId = req.user._id;
  const receiverId = req.params.receiverId;
  const { content } = req.body;

  try {
    const msg = new Message({
      sender: currentUserId,
      receiver: receiverId,
      content,
    });

    await msg.save();

    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});


router.put("/:chatId/accept", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // ❗ Only receiver can accept
    if (chat.initiatedBy.toString() === req.user._id.toString()) {
      return res.status(403).json({ error: "You cannot accept your own request" });
    }

    chat.status = "ACCEPTED";
    await chat.save();

    res.json({ success: true });

  } catch (err) {
    console.error("❌ Accept chat error:", err);
    res.status(500).json({ error: "Failed to accept chat" });
  }
});


router.put("/:chatId/block", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    chat.status = "BLOCKED";
    chat.blockedBy = req.user._id;
    await chat.save();

    res.json({ success: true });

  } catch (err) {
    console.error("❌ Block chat error:", err);
    res.status(500).json({ error: "Failed to block chat" });
  }
});


module.exports = router;
