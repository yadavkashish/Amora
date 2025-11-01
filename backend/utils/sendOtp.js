const nodemailer = require("nodemailer");

// ✅ Create transporter with Gmail
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
secure: false, // use STARTTLS

  auth: {
    user: process.env.GMAIL_USER, // your Gmail
    pass: process.env.GMAIL_PASS, // App Password
  },
  logger: true, // logs SMTP activity
  debug: true,  // prints communication with the server
});

// ✅ Verify transporter on startup
transporter.verify((err, success) => {
  if (err) {
    console.error("❌ SMTP verification failed:", err);
  } else {
    console.log("✅ SMTP server ready to send emails");
  }
});

const sendOtpEmail = async (to, otp) => {
  try {
    const mailOptions = {
      from: `"Amora" <${process.env.GMAIL_USER}>`,
      to,
      subject: "Your Amora OTP Code",
      text: `Hi! Your Amora verification code is ${otp}. It’s valid for the next 5 minutes. Enter it to continue your journey to meaningful connections!`,
      html: `<p>Hi! Your Amora verification code is <b>${otp}</b>.</p>
             <p>It’s valid for the next <b>5 minutes</b>. Enter it to continue your journey to meaningful connections! ❤️</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("❌ Error sending OTP:", error);

    // Helpful debug info
    if (error.response) console.error("SMTP response:", error.response);
    if (error.code) console.error("SMTP code:", error.code);

    throw new Error("Failed to send OTP. Check SMTP config or environment variables.");
  }
};

module.exports = { sendOtpEmail };
