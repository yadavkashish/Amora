const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const Order = require("../models/Order");
const User = require("../models/User");

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { args: ["--no-sandbox"] },
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
    const phone = msg.from; // 91xxxxxxxx@c.us

    // -------------------------------
    // STEP 1: USER OPENS PAYMENT CHAT
    // -------------------------------
    if (body.includes("Order ID")) {
      const orderIdMatch = body.match(/Order ID:\s*([a-f0-9]{24})/i);
      if (!orderIdMatch) return;

      const orderId = orderIdMatch[1];

      await Order.findByIdAndUpdate(orderId, {
        phone,
      });

      await msg.reply(`
✅ PAYMENT INSTRUCTIONS

• Pay using *WhatsApp Pay only*
• Enter the exact amount
• Do NOT use GPay / PhonePe

Once payment is done, premium will unlock automatically.
`);
      return;
    }

    // ------------------------------------
    // STEP 2: DETECT WHATSAPP PAY RECEIPT
    // ------------------------------------
    const isReceipt =
      body.includes("Paid ₹") ||
      body.includes("paid to") ||
      body.includes("Completed") ||
      body.includes("₹") && body.includes("paid") ||
      body.includes("का भुगतान");

    if (!isReceipt) return;

    const amountMatch = body.match(/₹\s?(\d+(\.\d{1,2})?)/);
    if (!amountMatch) return;

    const amount = Number(amountMatch[1]);

    const order = await Order.findOne({
      status: "PENDING",
      finalAmount: amount,
      phone,
      createdAt: {
        $gte: new Date(Date.now() - 15 * 60 * 1000), // last 15 min
      },
    });

    if (!order) return;

    // ------------------------------------
    // ACTIVATE PREMIUM
    // ------------------------------------
    order.status = "PAID";
    await order.save();

    const days = order.planType === "yearly" ? 365 : 30;

    await User.findByIdAndUpdate(order.userId, {
      isPremium: true,
      subscriptionType: order.planType,
      subscriptionExpiry: new Date(Date.now() + days * 86400000),
    });

    await msg.reply("✅ Payment received!\n🎉 Premium activated.");

    console.log("✅ Premium unlocked for", order.userId);
  } catch (err) {
    console.error("WhatsApp error:", err);
  }
});

client.initialize();
