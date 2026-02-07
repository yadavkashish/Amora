const { Client, RemoteAuth } = require("whatsapp-web.js");
const { MongoStore } = require("wwebjs-mongo");
const qrcode = require("qrcode-terminal");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const User = require("../models/User");

const initBot = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("✅ WhatsApp bot connected to MongoDB");

  const store = new MongoStore({ mongoose: mongoose });

  const client = new Client({
    authStrategy: new RemoteAuth({
      store: store,
      backupSyncIntervalMs: 300000,
    }),
    puppeteer: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--single-process",
      ],
    },
  });

  client.on("qr", (qr) => {
    console.log("SCAN THIS QR CODE IN YOUR LOGS:");
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    console.log("✅ WhatsApp Bot Ready & Authenticated");
  });

  client.on("remote_session_saved", () => {
    console.log("💾 Session saved to MongoDB");
  });

  // ✅ Use 'message' event instead of 'message_create' for incoming only
  client.on("message", async (msg) => {
    try {
      // 🔥 DEBUG: Log every incoming message
      console.log("📩 Incoming message:", {
        from: msg.from,
        body: msg.body,
        type: msg.type,
        isStatus: msg.isStatus,
      });

      const body = msg.body || "";
      const phone = msg.from;

      // Skip status messages and group messages
      if (msg.isStatus || msg.from.includes("@g.us")) {
        return;
      }

      // --- STEP 1: INITIAL LINKING ---
      if (body.includes("[Code:")) {
        const codeMatch = body.match(/\[Code:\s*(\d{6})\]/);
        if (codeMatch) {
          const shortId = codeMatch[1];
          console.log(`🔍 Looking for order with shortId: ${shortId}`);

          const order = await Order.findOneAndUpdate(
            { shortId, status: "PENDING" },
            { phone: phone },
            { new: true },
          );

          if (order) {
            await msg.reply(
              "🔗 *Order Linked!* Send the payment now. Premium will activate automatically.",
            );
            console.log(`✅ Linked ${shortId} to ${phone}`);
          } else {
            await msg.reply("❌ Invalid or expired code. Please try again.");
            console.log(`❌ No pending order found for shortId: ${shortId}`);
          }
        }
        return;
      }

      // --- STEP 2: PAYMENT DETECTION ---
      const isPayment =
        msg.type === "payment" ||
        (/Completed|Paid ₹|Success/i.test(body) && body.includes("₹"));

      if (isPayment) {
        console.log(`💰 Payment bubble detected from ${phone}`);
        const order = await Order.findOne({
          phone: phone,
          status: "PENDING",
        }).sort({ createdAt: -1 });

        if (order) {
          order.status = "PAID";
          await order.save();

          const days = order.planType === "yearly" ? 365 : 30;
          await User.findByIdAndUpdate(order.userId, {
            isPremium: true,
            subscriptionType: order.planType,
            subscriptionExpiry: new Date(
              Date.now() + days * 24 * 60 * 60 * 1000,
            ),
          });

          await msg.reply(
            "✅ *Payment received!* Premium is now active. Refresh your dashboard! 🚀",
          );
          console.log(`✅ Activated Premium for ${order.userId}`);
        } else {
          console.log(`⚠️ No pending order found for phone: ${phone}`);
        }
      }

      // --- OPTIONAL: Catch-all for testing ---
      // Uncomment this to test if bot receives ANY message
      // if (body.toLowerCase() === "ping") {
      //   await msg.reply("🏓 Pong! Bot is working.");
      // }
    } catch (err) {
      console.error("❌ Bot Logic Error:", err);
    }
  });

  client.initialize();

  return client; // Return client for potential external use
};

// ✅ Auto-initialize when required (or export for manual init)
module.exports = initBot;
