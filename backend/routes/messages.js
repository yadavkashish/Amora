const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const Chat = require("../models/Chat");
const { protect } = require("../middleware/auth");

router.use(protect);

/* ---------------------------
   GET MESSAGES BETWEEN USERS
--------------------------- */
router.get("/:otherUserId", async (req, res) => {
  const currentUserId = req.user._id;
  const otherUserId = req.params.otherUserId;

  try {
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId },
      ],
      deletedFor: { $ne: currentUserId }
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

/* ---------------------------
   SEND A MESSAGE
--------------------------- */
router.post("/:receiverId", async (req, res) => {
  const senderId = req.user._id;
  const receiverId = req.params.receiverId;
  const { content } = req.body;

  const chat = await Chat.findOne({
    participants: { $all: [senderId, receiverId] }
  });

  if (!chat) {
    return res.status(400).json({ error: "Chat does not exist" });
  }

  // YOU BLOCKED THEM — cannot send
  if (chat.status === "BLOCKED" && chat.blockedBy?.toString() === senderId.toString()) {
    return res.status(403).json({ error: "You have blocked this user" });
  }

  let delivered = true;

  // THEY BLOCKED YOU — message is saved but not delivered
  if (chat.status === "BLOCKED" && chat.blockedBy?.toString() !== senderId.toString()) {
    delivered = false;
  }

  const msg = await Message.create({
    sender: senderId,
    receiver: receiverId,
    content,
    timestamp: new Date(),
    delivered,
  });

  chat.lastMessage = msg._id;
  await chat.save();

  if (delivered) {
    req.app.get("io").to(receiverId.toString()).emit("newMessage", msg);
  }

  res.json(msg);
});

/* ---------------------------
   MARK AS SEEN
--------------------------- */
router.put("/seen/:otherUserId", async (req, res) => {
  const currentUserId = req.user._id;
  const otherUserId = req.params.otherUserId;

  await Message.updateMany(
    { sender: otherUserId, receiver: currentUserId, seen: false },
    { $set: { seen: true } }
  );

  req.app.get("io")
    .to(otherUserId.toString())
    .emit("seenMessage", { userId: currentUserId });

  res.json({ success: true });
});

/* ---------------------------
   DELETE MESSAGE
--------------------------- */
router.put("/delete/:messageId", async (req, res) => {
  const currentUserId = req.user._id;
  const { messageId } = req.params;

  const message = await Message.findById(messageId);

  if (!message) {
    return res.status(404).json({ error: "Message not found" });
  }

  if (!message.deletedFor.includes(currentUserId)) {
    message.deletedFor.push(currentUserId);
  }

  const bothDeleted =
    message.deletedFor.includes(message.sender.toString()) &&
    message.deletedFor.includes(message.receiver.toString());

  if (bothDeleted) {
    await Message.findByIdAndDelete(message._id);
    return res.json({ success: true, message: "Message deleted permanently" });
  }

  await message.save();
  res.json({ success: true });
});

module.exports = router;
