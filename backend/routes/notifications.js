const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const Chat = require("../models/Chat");
const { protect } = require("../middleware/auth");

// Protect all
router.use(protect);


router.put("/seen/all", async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, seen: false },
    { $set: { seen: true } }
  );
  res.json({ success: true });
});


/* ======================================================
   GET ALL NOTIFICATIONS
====================================================== */
router.get("/", async (req, res) => {
  try {
    const list = await Notification.find({ user: req.user._id })
      .populate("fromUser", "name profilePic")
      .populate("chatId", "_id status participants")
      .sort({ createdAt: -1 });

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to load notifications" });
  }
});

/* ======================================================
   UNREAD COUNT
====================================================== */
router.get("/unread/count", async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      seen: false,
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: "Failed to load unread count" });
  }
});

/* ======================================================
   ACCEPT REQUEST
====================================================== */
router.put("/:notifId/accept", async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.notifId);

    if (!notif)
      return res.status(404).json({ error: "Notification not found" });

    if (!notif.chatId)
      return res.status(400).json({ error: "Chat missing in notification" });

    const chat = await Chat.findById(notif.chatId);
    if (!chat) return res.status(404).json({ error: "Chat not found" });

    chat.status = "ACCEPTED";
    await chat.save();

    notif.requestStatus = "accepted";
    notif.seen = true;
    await notif.save();

    // 🔥 Emit socket event to notify the sender
    req.app.get("io").to(chat.initiatedBy.toString()).emit("notification");

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to accept request" });
  }
});

/* ======================================================
   REJECT REQUEST
====================================================== */
router.put("/:notifId/reject", async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.notifId);

    if (!notif)
      return res.status(404).json({ error: "Notification not found" });

    notif.requestStatus = "rejected";
    notif.seen = true;
    await notif.save();

    if (notif.chatId) {
      await Chat.findByIdAndDelete(notif.chatId);
    }

    // 🔥 Notify sender
    if (notif.fromUser) {
      req.app.get("io").to(notif.fromUser.toString()).emit("notification");
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to reject request" });
  }
});

module.exports = router;
