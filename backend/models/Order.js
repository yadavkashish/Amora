// models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    planType: { type: String, enum: ["monthly", "yearly"] },
    finalAmount: { type: Number, required: true },
    status: { type: String, enum: ["PENDING", "PAID"], default: "PENDING" },

    // 🔐 WhatsApp binding
    phone: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
