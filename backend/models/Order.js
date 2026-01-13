const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    planType: { type: String, enum: ["monthly", "yearly"] },
    finalAmount: { type: Number, required: true },
    status: { type: String, enum: ["PENDING", "PAID"], default: "PENDING" },
    phone: { type: String, default: null }, // Stores '91XXXXXXXXXX@c.us'
    shortId: { type: String, required: true }, 
  },
  { timestamps: true }
);

orderSchema.index({ phone: 1, status: 1 });

module.exports = mongoose.model("Order", orderSchema);