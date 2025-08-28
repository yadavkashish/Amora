const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // ✅ Gmail SMTP
  auth: {
    user: process.env.GMAIL_USER, // your Gmail address
    pass: process.env.GMAIL_PASS, // your App Password
  },
});

const sendOtpEmail = async (to, otp) => {
  try {
    const mailOptions = {
      from: `"Amora" <${process.env.GMAIL_USER}>`, // ✅ shows as Amora
      to,
      subject: "Your Amora OTP Code",
      text: `Hi! Your Amora verification code is ${otp}. It’s valid for the next 5 minutes. Enter it to continue your journey to meaningful connections!`,
      html: `<p>Hi! Your Amora verification code is <b>${otp}</b>.</p>
             <p>It’s valid for the next <b>5 minutes</b>. Enter it to continue your journey to meaningful connections! ❤️</p>`,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ OTP sent to", to);
  } catch (error) {
    console.error("❌ Error sending OTP:", error.message);
    throw error;
  }
};

module.exports = { sendOtpEmail };
