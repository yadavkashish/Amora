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
  secure: process.env.NODE_ENV === "production" ? true : false,
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
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
    const { name, email, password, otp, gender } = req.body;
    
    if (!name || !email || !password || !otp || !gender)
      return res.status(400).json({ error: "All fields are required" });

    // 🔑 Verify OTP
    const record = await Otp.findOne({ email, otp });
    if (!record)
      return res.status(400).json({ error: "Invalid or expired OTP" });

    // 🔑 Prevent duplicate email
    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ error: "Email already exists" });

    // ✅ Extract email domain
    const emailDomain = email.substring(email.lastIndexOf('@')).toLowerCase();

    // ✅ Create new user WITH emailDomain
    const user = new User({ 
      name, 
      email, 
      password, 
      gender,
      emailDomain // ✅ ADD THIS
    });
    await user.save();

    // 🔑 Clean up OTPs
    await Otp.deleteMany({ email });

    // ✅ Generate JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // ✅ Set cookie
    const isProduction = process.env.NODE_ENV === "production";
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/"
    });

    console.log('✅ User registered and cookie set:', {
      isProduction,
      sameSite: isProduction ? "None" : "Lax",
      secure: isProduction,
      userEmail: user.email,
      emailDomain: user.emailDomain // ✅ Log domain
    });

    res.status(201).json({
      message: "🎉 Account created & logged in successfully",
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        gender: gender || null,
        emailDomain: user.emailDomain // ✅ Return domain to frontend
      },
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

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // ✅ CREATE JWT TOKEN
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ✅ SET COOKIE WITH CORRECT OPTIONS
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });

    console.log('✅ Login successful, cookie set:', token.substring(0, 10) + '...');

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailDomain: user.emailDomain // ✅ Return domain
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};
