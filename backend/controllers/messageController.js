const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send a message
// @route   POST /api/messages/:receiverId
// @access  Private
exports.sendMessage = async (req, res) => {
  const senderId = req.user._id;
  const receiverId = req.params.receiverId;
  const { content } = req.body;

  if (!content || !receiverId) {
    return res.status(400).json({ error: 'Message content and receiver are required' });
  }

  try {
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
    });

    await message.save();

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// @desc    Get all messages between two users
// @route   GET /api/messages/:otherUserId
// @access  Private
exports.getMessages = async (req, res) => {
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
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};
