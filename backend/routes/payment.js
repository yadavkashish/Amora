const router = require("express").Router();
const { protect } = require("../middleware/auth");
const Order = require("../models/Order");
const User = require("../models/User");
router.post("/create-order", protect, async (req, res) => {
  try {
    const { planType } = req.body; // "monthly" or "yearly"

    if (!["monthly", "yearly"].includes(planType)) {
      return res.status(400).json({ error: "Invalid plan type" });
    }

    const basePrice = planType === "monthly" ? 49 : 299;

    // unique decimal (.01–.99) to identify UPI payments
    const randomDecimal = (Math.floor(Math.random() * 99) + 1) / 100;
    const finalAmount = Number((basePrice + randomDecimal).toFixed(2));

    const newOrder = new Order({
      userId: req.user._id,
      planType,
      finalAmount,
      status: "PENDING",
    });

    await newOrder.save();

    res.json({
      success: true,
      amount: finalAmount,
      orderId: newOrder._id,
    });
  } catch (err) {
    console.error("❌ Payment order error:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// ⚠️ IMPORTANT: Use a Secret Key so random people can't trigger this!
const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET;

router.post("/sms-confirm", async (req, res) => {
  try {
    const { message, secret } = req.body;

    // Validate the request source
    if (secret !== WEBHOOK_SECRET) {
      return res.status(401).json({ error: "Unauthorized source" });
    }

    // Regex to find the amount in your Bank SMS. 
    // Example SMS: "A/c XX123 Credited for INR 49.12 via UPI..."
    const amountMatch = message.match(/(?:INR|Rs\.?|₹)\s?(\d+\.\d{2})/i);
    
    if (amountMatch) {
      const receivedAmount = parseFloat(amountMatch[1]);

      // 1. Find the PENDING order with this EXACT unique decimal
      const order = await Order.findOne({ 
        finalAmount: receivedAmount, 
        status: "PENDING" 
      });

      if (order) {
        // 2. Mark Order as PAID
        order.status = "PAID";
        await order.save();

        // 3. Update the User to Premium
        const days = order.planType === "yearly" ? 365 : 30;
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + days);

        await User.findByIdAndUpdate(order.userId, {
          isPremium: true,
          subscriptionType: order.planType,
          subscriptionExpiry: expiryDate,
        });

        console.log(`✅ Payment Verified: ₹${receivedAmount} for User ${order.userId}`);
        return res.status(200).send("Verified");
      }
    }
    
    res.status(404).send("No matching order found");
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
