// routes/payment.js
const router = require("express").Router();
const { protect } = require("../middleware/auth");
const Order = require("../models/Order");

router.post("/create-order", protect, async (req, res) => {
  try {
    const { planType } = req.body;

    const basePrice = planType === "monthly" ? 49 : 299;
    const randomPaise = (Math.floor(Math.random() * 99) + 1) / 100;
    const finalAmount = Number((basePrice + randomPaise).toFixed(2));

    const order = await Order.create({
      userId: req.user._id,
      planType,
      finalAmount,
    });

    res.json({
      success: true,
      orderId: order._id,
      amount: finalAmount,
    });
  } catch (err) {
    res.status(500).json({ error: "Order creation failed" });
  }
});

module.exports = router;
