const { Client, RemoteAuth } = require("whatsapp-web.js");
const { MongoStore } = require("wwebjs-mongo");
const qrcode = require("qrcode-terminal");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const User = require("../models/User");

const initBot = () => {
  const store = new MongoStore({ mongoose });

  const client = new Client({
    authStrategy: new RemoteAuth({
      store,
      backupSyncIntervalMs: 300000,
    }),
    puppeteer: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    },
  });

  client.on("qr", (qr) => {
    console.log("📲 Scan this QR:");
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    console.log("✅ WhatsApp Bot Ready");
  });

  client.on("message", async (msg) => {
    try {
      if (msg.fromMe) return; // 🔥 VERY IMPORTANT

      const body = msg.body?.trim() || "";
      const phone = msg.from;

      console.log("📩 Incoming:", phone, body);

      // ---------------- STEP 1: ORDER LINKING ----------------
      if (body.includes("[Code:")) {
        const match = body.match(/\[Code:\s*(\d{6})\]/);

        if (match) {
          const shortId = match[1];

          const order = await Order.findOneAndUpdate(
            { shortId, status: "PENDING" },
            { phone },
            { new: true }
          );

          if (order) {
            await msg.reply(
              "🔗 *Order linked successfully!*\nNow send the payment screenshot or confirmation text."
            );
            return;
          }
        }
      }

      // ---------------- STEP 2: PAYMENT TEXT DETECTION ----------------
      const paymentKeywords =
        /paid|payment successful|upi|completed|success|₹/i.test(body);

      if (paymentKeywords) {
        console.log("💰 Payment text detected");

        const order = await Order.findOne({
          phone,
          status: "PENDING",
        }).sort({ createdAt: -1 });

        if (!order) {
          await msg.reply("❌ No pending order found for this number.");
          return;
        }

        order.status = "PAID";
        await order.save();

        const days = order.planType === "yearly" ? 365 : 30;

        await User.findByIdAndUpdate(order.userId, {
          isPremium: true,
          subscriptionType: order.planType,
          subscriptionExpiry: new Date(
            Date.now() + days * 24 * 60 * 60 * 1000
          ),
        });

        await msg.reply(
          "✅ *Payment received!*\nPremium activated 🚀\nPlease refresh your dashboard."
        );

        console.log("🔥 Premium activated:", order.userId);
      }
    } catch (err) {
      console.error("❌ Bot Error:", err);
    }
  });

  client.initialize();
};

module.exports = initBot;
