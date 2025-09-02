const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const Profile = require('../models/Profile'); // ✅ import Profile

router.use(protect);

// 📌 Get all users this user has chatted with (chat list with last message + unread count)
router.get('/', async (req, res) => {
  const currentUserId = req.user._id;

  try {
    // Get all messages involving this user
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
      deletedFor: { $ne: currentUserId } // exclude deleted ones
    }).sort({ timestamp: -1 });

    const userMap = {};

    messages.forEach(msg => {
      const otherUser = msg.sender.toString() === currentUserId.toString()
        ? msg.receiver.toString()
        : msg.sender.toString();

      if (!userMap[otherUser]) {
        userMap[otherUser] = msg; // store latest message
      }
    });

    // Get profiles for all users we have chatted with
    const profiles = await Profile.find({ user: { $in: Object.keys(userMap) } })
      .populate('user', 'name');

    const chatList = await Promise.all(profiles.map(async profile => {
      if (!profile.user) return null; // skip if user is null

      const userIdStr = profile.user._id.toString();

      const unreadCount = await Message.countDocuments({
        sender: userIdStr,
        receiver: currentUserId,
        seen: false,
        deletedFor: { $ne: currentUserId }
      });

      return {
        _id: profile.user._id,
        name: profile.user.name,
        profilePic: profile.profilePic,
        lastMessage: userMap[userIdStr]?.content || "",
        timestamp: userMap[userIdStr]?.timestamp || null,
        unreadCount,
      };
    }));

    // Remove null entries caused by missing users
    res.json(chatList.filter(chat => chat !== null));

  } catch (err) {
    console.error("Error fetching chat list:", err);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// 📌 Get full chat with a user (excluding deleted messages for current user)
router.get('/:otherUserId', async (req, res) => {
  const currentUserId = req.user._id;
  const otherUserId = req.params.otherUserId;

  try {
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
      deletedFor: { $ne: currentUserId } // ✅ exclude deleted ones
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// 📌 Send a new message
router.post('/:receiverId', async (req, res) => {
  const currentUserId = req.user._id;
  const receiverId = req.params.receiverId;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Message content is required" });
  }

  try {
    const msg = new Message({
      sender: currentUserId,
      receiver: receiverId,
      content,
    });

    await msg.save();
    // ✅ Emit real-time update
    const io = req.app.get("io");
    io.to(receiverId.toString()).emit("newMessage", msg);
    io.to(currentUserId.toString()).emit("newMessage", msg);
    
    res.status(201).json(msg);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// 📌 Mark messages as seen
router.put("/seen/:otherUserId", async (req, res) => {
  const currentUserId = req.user._id;
  const otherUserId = req.params.otherUserId;

  try {
    await Message.updateMany(
      { sender: otherUserId, receiver: currentUserId, seen: false },
      { $set: { seen: true } }
    );

    //  Notify sender that their messages are seen
    const io = req.app.get("io");
    io.to(otherUserId.toString()).emit("seenMessage", {
      userId: currentUserId.toString()
    });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update seen status" });
  }
});

// 📌 Delete message (soft delete per user, hard delete if both delete)
router.put("/delete/:messageId", async (req, res) => {
  const currentUserId = req.user._id;
  const { messageId } = req.params;

  try {
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // ✅ Add current user to deletedFor if not already there
    if (!message.deletedFor.some(id => id.toString() === currentUserId.toString())) {
      message.deletedFor.push(currentUserId);
    }

    // ✅ If both users deleted → remove permanently
    const bothUsersDeleted =
      message.deletedFor.some(id => id.toString() === message.sender.toString()) &&
      message.deletedFor.some(id => id.toString() === message.receiver.toString());

    if (bothUsersDeleted) {
      await Message.findByIdAndDelete(message._id);
      return res.json({ success: true, message: "Message deleted permanently" });
    }

    // Otherwise, just save soft delete
    await message.save();
    res.json({ success: true, message: "Deleted for you only" });
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ error: "Failed to delete message" });
  }
});


module.exports = router;
