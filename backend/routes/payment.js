const router = require("express").Router();
const { protect } = require("../middleware/auth");
const Order = require("../models/Order");
const User = require("../models/User");
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// --- WHATSAPP BOT INITIALIZATION ---
const client = new Client({
    authStrategy: new LocalAuth(), // Persists login so you don't scan QR every time
    puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
});

client.on('qr', (qr) => {
    console.log('SCAN THIS QR CODE WITH WHATSAPP:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => console.log('✅ WhatsApp Bot is Ready!'));

// --- AUTOMATED PAYMENT VERIFICATION VIA WHATSAPP ---
client.on('message', async (msg) => {
    try {
        // Regex to find decimal amounts (e.g., 49.83) in the WhatsApp message
        const amountMatch = msg.body.match(/(\d+\.\d{2})/);
        
        if (amountMatch) {
            const amount = parseFloat(amountMatch[1]);
            const order = await Order.findOne({ finalAmount: amount, status: "PENDING" });

            if (order) {
                // 1. Mark Order as PAID
                order.status = "PAID";
                await order.save();

                // 2. Update User to Premium
                const days = order.planType === "yearly" ? 365 : 30;
                await User.findByIdAndUpdate(order.userId, {
                    isPremium: true,
                    subscriptionType: order.planType,
                    subscriptionExpiry: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
                });

                // 3. Optional: Reply to user on WhatsApp
                msg.reply("🎉 Payment Verified! Your Premium features are now unlocked. Go back to the app!");
                console.log(`✅ Automated WhatsApp Unlock: ₹${amount} for User ${order.userId}`);
            }
        }
    } catch (err) {
        console.error("WhatsApp Verification Error:", err);
    }
});

client.initialize();

// --- EXISTING CREATE ORDER ROUTE ---
router.post("/create-order", protect, async (req, res) => {
    try {
        const { planType } = req.body;
        if (!["monthly", "yearly"].includes(planType)) return res.status(400).json({ error: "Invalid plan" });

        const basePrice = planType === "monthly" ? 49 : 299;
        const randomDecimal = (Math.floor(Math.random() * 99) + 1) / 100;
        const finalAmount = Number((basePrice + randomDecimal).toFixed(2));

        const newOrder = new Order({
            userId: req.user._id,
            planType,
            finalAmount,
            status: "PENDING",
        });

        await newOrder.save();
        res.json({ success: true, amount: finalAmount, orderId: newOrder._id });
    } catch (err) {
        res.status(500).json({ error: "Order failed" });
    }
});

module.exports = router;