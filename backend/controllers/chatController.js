// controllers/chatController.js
// const Chat = require('../models/Chat');
const Message = require('../models/Message');

exports.accessChat = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).send('User ID is required');

  let chat = await Chat.findOne({
    users: { $all: [req.user._id, userId] }
  }).populate('users', '-password').populate('latestMessage');

  if (!chat) {
    chat = await Chat.create({ users: [req.user._id, userId] });
  }

  chat = await chat.populate('latestMessage.sender', 'name email');
  res.status(200).json(chat);
};

exports.fetchChats = async (req, res) => {
  try {
    const chats = await Chat.find({ users: req.user._id })
      .populate('users', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};

// controllers/chatController.js
exports.getMessages = async (req, res) => {
  const currentUserId = req.user._id;
  const otherUserId = req.params.otherUserId;

  try {
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
      deletedFor: { $nin: [currentUserId] }   // ✅ FIXED: user not in deletedFor array
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};



