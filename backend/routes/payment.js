// routes/payment.js
const router = require("express").Router();
const { protect } = require("../middleware/auth");
const Order = require("../models/Order");

router.post("/create-order", protect, async (req, res) => {
  try {
    const { planType } = req.body;
    
    // Generate a unique 6-digit code for this specific payment session
    const shortId = Math.floor(100000 + Math.random() * 900000).toString();

    const order = await Order.create({
      userId: req.user._id,
      planType,
      finalAmount: planType === "monthly" ? 49 : 299,
      shortId: shortId // Add this to your Order Model
    });

    res.json({
      success: true,
      orderId: order._id,
      shortId: shortId,
      amount: order.finalAmount,
    });
  } catch (err) {
    res.status(500).json({ error: "Order creation failed" });
  }
});

module.exports = router;
