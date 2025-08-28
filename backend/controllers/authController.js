const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Otp = require("../models/Otp");
const { sendOtpEmail } = require("../utils/sendOtp");
const bcrypt = require("bcryptjs");

const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ✅ Step 1: Send OTP (Signup)
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // remove old OTPs for this email
    await Otp.deleteMany({ email });
    await Otp.create({ email, otp });

    // send OTP to Gmail
    await sendOtpEmail(email, otp);

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("❌ Error sending OTP:", err.message);
    res.status(500).json({ error: "Error sending OTP" });
  }
};


// ✅ Step 2: Verify OTP & Register User
exports.verifyOtpAndRegister = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;
    if (!name || !email || !password || !otp)
      return res.status(400).json({ error: "All fields are required" });

    const record = await Otp.findOne({ email, otp });
    if (!record)
      return res.status(400).json({ error: "Invalid or expired OTP" });

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ error: "Email already exists" });

    // ✅ Ensure password gets hashed by pre-save hook
    const user = new User({ name, email, password });
    await user.save();

    await Otp.deleteMany({ email });

    const token = createToken(user._id);
    res.cookie("token", token, cookieOptions);
    res.status(201).json({
      message: "Account created successfully",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("❌ Registration error:", err.message);
    res.status(500).json({ error: "Server error during registration" });
  }
};


// ✅ Forgot Password: Send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await Otp.deleteMany({ email });
    await Otp.create({ email, otp });

    await sendOtpEmail(email, otp);
    res.json({ message: "OTP sent to reset password" });
  } catch (err) {
    console.error("❌ Forgot password error:", err.message);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

// ✅ Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword)
      return res.status(400).json({ error: "All fields are required" });

    // ✅ Validate OTP
    const record = await Otp.findOne({ email, otp });
    if (!record)
      return res.status(400).json({ error: "Invalid or expired OTP" });

    // ✅ Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // ✅ Assign new password (plain text)
    user.password = newPassword;

    // ✅ Save user (pre-save hook will hash password automatically)
    await user.save();

    // ✅ Clear OTP after successful reset
    await Otp.deleteMany({ email });

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("❌ Reset password error:", err.message);
    res.status(500).json({ error: "Failed to reset password" });
  }
};


// ✅ Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔑 Login attempt:", email);

    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);

    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = createToken(user._id);
    res.cookie("token", token, cookieOptions);
    res.json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ error: "Server error during login" });
  }
};
