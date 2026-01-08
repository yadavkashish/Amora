const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    planType: { type: String, enum: ["monthly", "yearly"] },
    finalAmount: { type: Number, required: true },
    status: { type: String, enum: ["PENDING", "PAID"], default: "PENDING" },
    phone: { type: String, default: null },
    shortId: { type: String, required: true }, // The 6-digit verification code
  },
  { timestamps: true }
);

// Indexing for faster lookups during payment processing
orderSchema.index({ phone: 1, status: 1, finalAmount: 1 });

module.exports = mongoose.model("Order", orderSchema);