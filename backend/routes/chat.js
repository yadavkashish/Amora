const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth'); // ✅ import the middleware

// ✅ Apply protect middleware
router.use(protect);

// Get list of users you've chatted with + last message
router.get('/', async (req, res) => {
  const currentUserId = req.user._id;

  try {
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    }).sort({ timestamp: -1 });

    const userMap = {};

    messages.forEach(msg => {
      const otherUser = msg.sender.toString() === currentUserId.toString()
        ? msg.receiver.toString()
        : msg.sender.toString();

      if (!userMap[otherUser]) {
        userMap[otherUser] = msg;
      }
    });

    const users = await User.find({ _id: { $in: Object.keys(userMap) } });

    const chatList = users.map(user => ({
      _id: user._id,
      name: user.name,
      profilePic: user.profilePic,
      lastMessage: userMap[user._id]?.content,
      timestamp: userMap[user._id]?.timestamp,
    }));

    res.json(chatList);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chats' });
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

module.exports = router;
