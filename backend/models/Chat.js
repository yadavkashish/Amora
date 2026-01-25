const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],

    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",

      required: true,
    },

    status: {
      type: String,
      enum: ["REQUESTED", "ACCEPTED", "REJECTED", "BLOCKED"],
      default: "REQUESTED",
    },

    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },

    readStatus: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        lastSeenMessage: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Message",
          default: null,
        },
        unreadCount: { type: Number, default: 0 },
      },
    ],

    requestNote: {
      type: String,
      maxlength: 150,
      default: null,
    },

    // ❌ REMOVE THIS — caused the error
    // note: { type: String, default: null, maxlength: 200 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Chat", chatSchema);
