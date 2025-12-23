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
      deletedFor: { $nin: [currentUserId] }   
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

exports.sendChatRequest = async (req, res) => {
  const from = req.user._id;
  const { toUserId } = req.body;

  if (from.equals(toUserId))
    return res.status(400).json({ error: "Invalid request" });

  const existing = await Chat.findOne({
    participants: { $all: [from, toUserId] }
  });

  if (existing) return res.json(existing);

  const chat = await Chat.create({
    participants: [from, toUserId],
    initiatedBy: from
  });

  // create notification
  const notification = await Notification.create({
    user: toUserId,
    fromUser: from,
    type: "CHAT_REQUEST",
    chat: chat._id
  });

  // realtime notify
  req.app.get("io")
    .to(toUserId.toString())
    .emit("notification", notification);

  res.status(201).json(chat);
};


exports.acceptChatRequest = async (req, res) => {
  const userId = req.user._id;
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId);
  if (!chat) return res.status(404).json({ error: "Chat not found" });

  if (!chat.participants.includes(userId))
    return res.status(403).json({ error: "Unauthorized" });

  chat.status = "ACCEPTED";
  await chat.save();

  const otherUser = chat.participants.find(id => !id.equals(userId));

  const notif = await Notification.create({
    user: otherUser,
    fromUser: userId,
    type: "REQUEST_ACCEPTED",
    chat: chat._id
  });

  req.app.get("io").to(otherUser.toString()).emit("notification", notif);

  res.json({ success: true });
};


exports.blockUser = async (req, res) => {
  const userId = req.user._id;
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId);
  if (!chat) return res.status(404).json({ error: "Chat not found" });

  chat.status = "BLOCKED";
  chat.blockedBy = userId;
  await chat.save();

  await User.findByIdAndUpdate(userId, {
    $addToSet: { blockedUsers: chat.participants }
  });

  res.json({ success: true });
};


