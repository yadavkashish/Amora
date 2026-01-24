const mongoose = require("mongoose");


const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    type: {
      type: String,
      enum: ["CHAT_REQUEST", "REQUEST_ACCEPTED"],
      required: true
    },

    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },

    seen: { type: Boolean, default: false },

    // ADD THIS ↓↓↓
    requestStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
