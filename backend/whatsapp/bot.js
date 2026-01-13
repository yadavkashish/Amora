const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const Order = require("../models/Order");
const User = require("../models/User");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { 
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true 
  },
});

client.on("qr", (qr) => {
  console.log("SCAN QR:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ WhatsApp Bot Ready");
});

client.on("message", async (msg) => {
  try {
    const body = msg.body || "";
    const phone = msg.from; // Format: 91XXXXXXXXXX@c.us
    const msgType = msg.type;

    console.log(`📩 New Message from ${phone} | Type: ${msgType} | Body: ${body}`);

    // --- STEP 1: INITIAL LINKING ---
    if (body.includes("[Code:")) {
      const codeMatch = body.match(/\[Code:\s*(\d{6})\]/);
      if (codeMatch) {
        const shortId = codeMatch[1];
        
        const updatedOrder = await Order.findOneAndUpdate(
          { shortId, status: "PENDING" }, 
          { phone: phone }
        );

        if (updatedOrder) {
          console.log(`✅ Linked Code ${shortId} to ${phone}`);
          // ALWAYS reply so the user knows the bot is active
          await msg.reply("🔗 *Order Linked!* Please complete the payment now. I will activate your premium automatically once done.");
        } else {
          await msg.reply("❌ Invalid or expired code. Please generate a new order.");
        }
        return;
      }
    }

    // --- STEP 2: PAYMENT DETECTION ---
    // WhatsApp Pay messages often have type 'payment' or specific keywords
    const isPaymentType = msgType === 'payment';
    const hasPaymentKeywords = /Completed|Sent to|Paid ₹|भुगतान|Success/i.test(body) && body.includes("₹");

    if (isPaymentType || hasPaymentKeywords) {
      console.log(`💰 Payment detected from ${phone}. Searching for linked order...`);

      // Find the order linked to this specific phone number
      const order = await Order.findOne({ 
        phone: phone, 
        status: "PENDING" 
      }).sort({ createdAt: -1 }); // Get the latest one

      if (!order) {
        console.log(`❓ Payment received from ${phone} but no pending order found.`);
        return;
      }

      // --- STEP 3: ACTIVATE ---
      order.status = "PAID";
      await order.save();

      const days = order.planType === "yearly" ? 365 : 30;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + days);

      await User.findByIdAndUpdate(order.userId, {
        isPremium: true,
        subscriptionType: order.planType,
        subscriptionExpiry: expiryDate,
      });

      await msg.reply("🚀 *PREMIUM ACTIVATED!* Your account has been upgraded. Please refresh your app dashboard.");
      console.log(`🎉 Success: Premium activated for User ${order.userId}`);
    }
  } catch (err) {
    console.error("CRITICAL BOT ERROR:", err);
  }
});

client.initialize();