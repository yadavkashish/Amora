// utils/sendOtpEmail.js
const { Resend } = require("resend");

// Initialize Resend with API Key from .env
const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpEmail = async (to, otp) => {
  try {
    const data = await resend.emails.send({
      from: "Amora <no-reply@amoraonline.in>", // use your verified domain
      to,
      subject: "Your Amora OTP Code",
      html: `
        <p>Hi! Your Amora verification code is <b>${otp}</b>.</p>
        <p>It’s valid for the next <b>5 minutes</b>. Enter it to continue your journey! ❤️</p>
      `,
    });

    console.log("✅ OTP sent successfully:", data);
    return data;
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    throw new Error("Failed to send OTP via Resend.");
  }
};

module.exports = { sendOtpEmail };
