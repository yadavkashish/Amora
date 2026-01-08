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
    const phone = msg.from;

    // --- STEP 1: BINDING & INSTRUCTIONS ---
    if (body.includes("Order ID")) {
      const codeMatch = body.match(/\[Code:\s*(\d{6})\]/);
      if (!codeMatch) return;

      const shortId = codeMatch[1];
      await Order.findOneAndUpdate({ shortId }, { phone });

      return msg.reply("✅ Order Linked. Please complete the WhatsApp Pay payment of ₹49 now.");
    }

    // --- STEP 2: PAYMENT DETECTION ---
    const isPayment = /Completed|Sent to|Paid ₹|भुगतान/i.test(body) && body.includes("₹");
    
    if (isPayment) {
      console.log(`Checking payment from ${phone}...`);

      // Look back through the last 10 messages to find the verification code
      const chat = await msg.getChat();
      const history = await chat.fetchMessages({ limit: 10 });
      
      let foundShortId = null;
      for (const m of history) {
        const match = m.body.match(/\[Code:\s*(\d{6})\]/);
        if (match) {
          foundShortId = match[1];
          break;
        }
      }

      if (!foundShortId) {
        console.log("Payment detected but no verification code found in recent chat.");
        return;
      }

      // Find the order with this code
      const order = await Order.findOne({ shortId: foundShortId, status: "PENDING" });
      if (!order) return;

      // ACTIVATE
      order.status = "PAID";
      await order.save();

      await User.findByIdAndUpdate(order.userId, {
        isPremium: true,
        subscriptionType: order.planType,
        subscriptionExpiry: new Date(Date.now() + (order.planType === "yearly" ? 365 : 30) * 86400000),
      });

      await msg.reply("🎉 *Premium Activated!* We detected your payment and verified it via Code: " + foundShortId);
      console.log(`✅ Premium Unlocked for User ${order.userId}`);
    }
  } catch (err) {
    console.error("Bot Error:", err);
  }
});

client.initialize();