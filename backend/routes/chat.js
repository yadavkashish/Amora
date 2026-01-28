const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const Chat = require("../models/Chat");
const Profile = require("../models/Profile");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const Notification = require("../models/Notification");

// protect all routes
router.use(protect);

/* ============================================================
   SEND CHAT REQUEST  (static route FIRST!)
============================================================ */
/* SEND CHAT REQUEST */
router.post("/request", async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId, note } = req.body;

    if (!receiverId)
      return res.status(400).json({ error: "Receiver is required" });

    const existing = await Chat.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (existing) {
      return res.status(400).json({ error: "Chat already exists" });
    }

    const chat = await Chat.create({
      participants: [senderId, receiverId],
      initiatedBy: senderId,
      status: "REQUESTED",
      requestNote: note || null,
      readStatus: [
        { user: senderId, unreadCount: 0 },
        { user: receiverId, unreadCount: 0 },
      ],
    });

    // ⭐ CREATE NOTIFICATION
    await Notification.create({
      user: receiverId,
      type: "CHAT_REQUEST",
      fromUser: senderId,
      chatId: chat._id,
      seen: false,
      requestStatus: "pending",
    });

    // ⭐ SEND REAL-TIME
    req.app.get("io").to(receiverId.toString()).emit("notification");

    res.json({ success: true, chat });
  } catch (err) {
    console.error("Chat request error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ============================================================
   BLOCK USER
============================================================ */
router.put("/:chatId/block", async (req, res) => {
  const userId = req.user._id;

  const chat = await Chat.findById(req.params.chatId);
  if (!chat) return res.status(404).json({ error: "Chat not found" });

  chat.status = "BLOCKED";
  chat.blockedBy = userId;
  await chat.save();

  res.json({ success: true });
});

/* ============================================================
   UNBLOCK USER
============================================================ */
router.put("/:chatId/unblock", async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);
  if (!chat) return res.status(404).json({ error: "Chat not found" });

  chat.status = "ACCEPTED";
  chat.blockedBy = null;

  await chat.save();
  res.json({ success: true });
});

/* ============================================================
   GET CHAT META
============================================================ */
router.get("/meta/:otherUserId", async (req, res) => {
  const userId = req.user._id;

  const chat = await Chat.findOne({
    participants: { $all: [userId, req.params.otherUserId] },
  });

  if (!chat) return res.json(null);

  res.json({
    chatId: chat._id,
    status: chat.status,
    initiatedBy: chat.initiatedBy.toString(),
    blockedBy: chat.blockedBy?.toString() || null,
  });
});

/* ============================================================
   MARK AS SEEN
============================================================ */
router.put("/seen/:otherUserId", async (req, res) => {
  const userId = req.user._id;

  const chat = await Chat.findOne({
    participants: { $all: [userId, req.params.otherUserId] },
  });

  if (!chat) return res.status(404).json({ error: "Chat not found" });

  await Chat.updateOne(
    { _id: chat._id },
    {
      $set: {
        "readStatus.$[u].unreadCount": 0,
        "readStatus.$[u].lastSeenMessage": chat.lastMessage,
      },
    },
    { arrayFilters: [{ "u.user": userId }] },
  );

  req.app.get("io").to(req.params.otherUserId.toString()).emit("seenMessage", {
    userId,
  });

  res.json({ success: true });
});

/* ============================================================
   GET CHAT LIST
============================================================ */
router.get("/", async (req, res) => {
  const userId = req.user._id;

  try {
    const chats = await Chat.find({
      participants: userId,
      status: { $in: ["ACCEPTED", "BLOCKED"] },
    }).sort({ updatedAt: -1 });

    const otherUserIds = chats.map((chat) =>
      chat.participants.find((id) => id.toString() !== userId.toString()),
    );

    const profiles = await Profile.find({
      user: { $in: otherUserIds },
    }).populate("user", "name");

    // Fetch last messages
    const allMessages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ timestamp: -1 })
      .lean();

    const messageMap = {};
    allMessages.forEach((msg) => {
      const other =
        msg.sender.toString() === userId.toString()
          ? msg.receiver.toString()
          : msg.sender.toString();

      if (!messageMap[other]) messageMap[other] = msg;
    });

    const chatList = await Promise.all(
      chats.map(async (chat) => {
        const otherUserId = chat.participants.find(
          (id) => id.toString() !== userId.toString(),
        );

        const profile = profiles.find(
          (p) => p.user._id.toString() === otherUserId.toString(),
        );

        // ⬅ FIX: async inside Promise.all
        const userData = await User.findOne({
          _id: otherUserId,
          deleted: false,
        }).lean();

        let name = "Deleted Account";
        let profilePic = "/deleted-user.png";
        let isDeleted = userData?.deleted || false;

        if (userData && !userData.deleted) {
          name = profile?.user?.name || "Unknown";
          profilePic = profile?.profilePic || null;
        }

        const lastMsg =
          chat.status === "BLOCKED"
            ? null
            : messageMap[otherUserId.toString()] || null;

        const read = chat.readStatus.find(
          (r) => r.user.toString() === userId.toString(),
        );

        return {
          _id: otherUserId,
          name,
          profilePic,
          isDeleted,

          isBlocked: chat.status === "BLOCKED",
          blockedBy: chat.blockedBy?.toString() || null,

          chatId: chat._id,
          chatStatus: chat.status,
          initiatedBy: chat.initiatedBy,

          lastMessage: lastMsg?.content || "",
          timestamp: lastMsg?.timestamp || chat.createdAt,
          lastMessageSender: lastMsg?.sender?.toString() || null,

          unreadCount: chat.status === "BLOCKED" ? 0 : read?.unreadCount || 0,
        };
      }),
    );

    res.json(chatList);
  } catch (err) {
    console.error("❌ Fetch chat list error:", err);
    res.status(500).json({ error: "Failed to load chats" });
  }
});

router.get("/:otherUserId", async (req, res) => {
  const currentUserId = req.user._id;
  const otherUserId = req.params.otherUserId;

  const chat = await Chat.findOne({
    participants: { $all: [currentUserId, otherUserId] }
  });

  if (!chat) return res.json([]);

  let messages = await Message.find({
    $or: [
      { sender: currentUserId, receiver: otherUserId },
      { sender: otherUserId, receiver: currentUserId },
    ],
    deletedFor: { $ne: currentUserId }
  }).sort({ timestamp: 1 });

  // 🟥 If current user BLOCKED the other one → hide messages they sent after block
  if (chat.status === "BLOCKED" && chat.blockedBy?.toString() === currentUserId.toString()) {
    messages = messages.filter((m) => m.sender.toString() !== otherUserId);
  }

  // 🟪 If current user IS BLOCKED by the other → hide messages sent AFTER block
  if (chat.status === "BLOCKED" && chat.blockedBy?.toString() === otherUserId.toString()) {
    messages = messages.filter((m) => m.sender.toString() !== otherUserId);
  }

  res.json(messages);
});


router.post("/:receiverId", async (req, res) => {
  const senderId = req.user._id;
  const receiverId = req.params.receiverId;
  const { content } = req.body;

  const chat = await Chat.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!chat) {
    return res.status(400).json({ error: "Chat does not exist" });
  }

  // ❌ Neither side can send messages in a blocked chat
  let delivered = chat.status !== "BLOCKED";

  const msg = await Message.create({
    sender: senderId,
    receiver: receiverId,
    content,
    timestamp: new Date(),
    delivered,
  });

  chat.lastMessage = msg._id;
  await chat.save();

  // 🚫 Only deliver if not blocked
  if (delivered) {
    req.app.get("io").to(receiverId.toString()).emit("newMessage", msg);
  }

  res.json(msg);
});

/* ============================================================
   GET MESSAGES (dynamic)
============================================================ */

/* ============================================================
   ACCEPT REQUEST
============================================================ */
router.put("/:chatId/accept", async (req, res) => {
  const userId = req.user._id;

  const chat = await Chat.findById(req.params.chatId);
  if (!chat) return res.status(404).json({ error: "Chat not found" });

  if (chat.initiatedBy.toString() === userId.toString())
    return res.status(403).json({ error: "Cannot accept your own request" });

  await Notification.create({
    user: chat.initiatedBy,
    type: "REQUEST_ACCEPTED",
    fromUser: userId,
  });

  req.app.get("io").to(chat.initiatedBy.toString()).emit("notification");

  chat.status = "ACCEPTED";
  await chat.save();

  res.json({ success: true });
});

/* ============================================================
   REJECT REQUEST  (needed by RequestsList)
============================================================ */
router.put("/:chatId/reject", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    await Notification.deleteMany({ chatId: chat._id }); // remove notif also
    await Chat.findByIdAndDelete(chat._id);

    res.json({ success: true });
  } catch (err) {
    console.error("Reject request error:", err);
    res.status(500).json({ error: "Failed to reject request" });
  }
});

/* ============================================================
   BLOCK LIST
============================================================ */
router.get("/blocked/list", async (req, res) => {
  const chats = await Chat.find({
    participants: req.user._id,
    blockedBy: req.user._id,
  }).populate("participants", "name profilePic");

  const list = chats.map((chat) => {
    const other = chat.participants.find(
      (p) => p._id.toString() !== req.user._id.toString(),
    );

    return {
      _id: other._id,
      name: other.name,
      profilePic: other.profilePic,
      chatId: chat._id,
    };
  });

  res.json(list);
});

/* ============================================================
   UNREAD NOTIFICATION COUNT
============================================================ */
// router.get("/unread", async (req, res) => {
//   const count = await Notification.countDocuments({
//     user: req.user._id,
//     read: false,
//   });

//   res.json({ count });
// });

/* ============================================================
   LIST REQUESTS
============================================================ */
router.get("/requests/list", async (req, res) => {
  const userId = req.user._id;

  const requests = await Chat.find({
    participants: userId,
    status: "REQUESTED",
    initiatedBy: { $ne: userId },
  }).populate("participants", "name profilePic");

  const formatted = requests.map((chat) => {
    const other = chat.participants.find(
      (u) => u._id.toString() !== userId.toString(),
    );

    return {
      chatId: chat._id,
      userId: other._id,
      name: other.name,
      profilePic: other.profilePic,
      note: chat.requestNote || null,
    };
  });

  res.json(formatted);
});

/* ============================================================
   EXPORT ROUTER  (must be last line!)
============================================================ */
module.exports = router;
