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

    // --- STEP 1: INITIAL LINKING ---
    // User arrives from Frontend with the Code in the message
    if (body.includes("Order ID") && body.includes("[Code:")) {
      const codeMatch = body.match(/\[Code:\s*(\d{6})\]/);
      if (!codeMatch) return;

      const shortId = codeMatch[1];
      // Save the phone number to the order so we know who to watch
      await Order.findOneAndUpdate({ shortId }, { phone });

      console.log(`🔗 Linked Code ${shortId} to phone ${phone}`);
      return; // No reply needed here, user is about to pay
    }

    // --- STEP 2: PAYMENT DETECTION ---
    const isPayment = /Completed|Sent to|Paid ₹|भुगतान/i.test(body) && body.includes("₹");
    
    if (isPayment) {
      console.log(`💰 Payment bubble detected from ${phone}. Verifying...`);

      // We fetch the last 10 messages to find the verification code sent earlier
      const chat = await msg.getChat();
      const history = await chat.fetchMessages({ limit: 10 });
      
      let foundShortId = null;
      // Search history for the bracketed code
      for (const m of history) {
        const match = m.body.match(/\[Code:\s*(\d{6})\]/);
        if (match) {
          foundShortId = match[1];
          break;
        }
      }

      if (!foundShortId) {
        console.log("❌ Payment found, but no [Code] found in recent chat history.");
        return;
      }

      // Find the PENDING order with this code
      const order = await Order.findOne({ shortId: foundShortId, status: "PENDING" });
      
      if (!order) {
        console.log(`❌ No pending order found for Code: ${foundShortId}`);
        return;
      }

      // --- STEP 3: ACTIVATE ---
      order.status = "PAID";
      await order.save();

      const days = order.planType === "yearly" ? 365 : 30;
      await User.findByIdAndUpdate(order.userId, {
        isPremium: true,
        subscriptionType: order.planType,
        subscriptionExpiry: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      });

      // --- STEP 4: YOUR CUSTOM REPLY ---
      await msg.reply("✅ Payment received! *Go to your profile and refresh, premium is activated.* 🚀");
      
      console.log(`✅ Success: Premium activated for User ${order.userId}`);
    }
  } catch (err) {
    console.error("WhatsApp Bot Error:", err);
  }
});

client.initialize();