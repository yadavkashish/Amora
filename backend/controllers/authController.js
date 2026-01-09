// controllers/authController.js
const jwt = require("jsonwebtoken");
const Otp = require("../models/Otp");
const User = require("../models/User");
const { sendOtpEmail } = require("../utils/sendOtp");
const bcrypt = require("bcryptjs");
const { encryptDescriptor, decryptDescriptor } = require("../utils/cryptoUtil");
require('dotenv').config();

// helper to gen otp
function genOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// cookie options factory (so SameSite = None in production)
function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd, // Secure must be true when SameSite=None
    sameSite: isProd ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

/**
 * Send OTP
 * Expects: { email, descriptor } where descriptor is face-api.js descriptor array (Float32) from client
 * Stores encrypted descriptor in Otp document temporarily.
 */
exports.sendOtp = async (req, res) => {
  try {
    const { email, descriptor } = req.body;
    console.log("📩 sendOtp called");
    console.log("Email:", email);
    console.log("Descriptor type:", typeof descriptor);
    console.log("Is array:", Array.isArray(descriptor));
    console.log("Descriptor length:", descriptor?.length);

    if (!email || !descriptor) return res.status(400).json({ error: "Email and selfie descriptor are required" });

    // generate OTP
    const otp = genOtp();

    // remove existing OTP docs for this email
    await Otp.deleteMany({ email });

    // encrypt descriptor and store in Otp
    const enc = encryptDescriptor(descriptor);
    await Otp.create({ email, otp, signupSelfieEncrypted: enc });

    // send OTP by email
    await sendOtpEmail(email, otp);

    return res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("❌ Error sending OTP:", err.message);
    return res.status(500).json({ error: "Error sending OTP" });
  }
};

/**
 * Verify OTP and Register User
 * Expects: { name, email, password, otp, gender }
 * Uses encrypted descriptor stored in Otp to save into newly created User.
 */
exports.verifyOtpAndRegister = async (req, res) => {
  try {
    const { name, email, password, otp, gender } = req.body;

    if (!name || !email || !password || !otp || !gender)
      return res.status(400).json({ error: "All fields are required" });

    // lookup OTP doc with stored encrypted descriptor
    const record = await Otp.findOne({ email, otp });
    if (!record) return res.status(400).json({ error: "Invalid or expired OTP" });

    // prevent duplicate email
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: "Email already exists" });

    // create new user, persist encrypted signup selfie to user's record
    const user = new User({
      name,
      email,
      password,
      gender,
      signupSelfieEncrypted: record.signupSelfieEncrypted,
    });
    await user.save();

    // cleanup OTP records
    await Otp.deleteMany({ email });

    // generate token & set cookie
    const token = createToken(user._id);
    res.cookie("token", token, cookieOptions());

    return res.status(201).json({
      message: "Account created & logged in successfully",
      user: { id: user._id, name: user.name, email: user.email, gender: user.gender },
    });
  } catch (err) {
    console.error("❌ Registration error:", err.message);
    return res.status(500).json({ error: "Server error during registration" });
  }
};

// ✅ Forgot Password: Send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const otp = genOtp();

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
    if (!email || !otp || !newPassword) return res.status(400).json({ error: "All fields are required" });

    // ✅ Validate OTP
    const record = await Otp.findOne({ email, otp });
    if (!record) return res.status(400).json({ error: "Invalid or expired OTP" });

    // ✅ Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // ✅ Assign new password (will be hashed by pre-save)
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
      return res.status(400).json({ error: "Email and password required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // ✅ CREATE JWT TOKEN
    const token = createToken(user._id);

    // ✅ SET COOKIE WITH CORRECT OPTIONS (SameSite None in production)
    res.cookie("token", token, cookieOptions());

    console.log("✅ Login successful, cookie set");

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailDomain: user.emailDomain,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

// ---------- helper euclidean for descriptor compare ----------
function euclidean(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
    throw new Error("Invalid descriptor lengths");
  }
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

// Compare profile descriptor to stored signup selfie descriptor.
exports.compareProfileDescriptor = async (req, res) => {
  try {
    const userId = req.user && (req.user._id || req.user.userId);
    if (!userId) return res.status(401).json({ error: "Not authorized" });

    const newDesc = req.body.profileDescriptor;
    if (!newDesc || !Array.isArray(newDesc)) {
      return res.status(400).json({ error: "profileDescriptor is required (array)" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // choose base descriptor: latest profile descriptor (preferred) else signup selfie
    let baseEncrypted = user.profileDescriptorEncrypted || user.signupSelfieEncrypted;
    if (!baseEncrypted) {
      return res.status(404).json({ error: "No stored descriptor to compare with" });
    }

    let baseDesc;
    try {
      baseDesc = decryptDescriptor(baseEncrypted);
    } catch (e) {
      console.error("Failed to decrypt stored descriptor:", e);
      return res.status(500).json({ error: "Failed to decrypt stored descriptor" });
    }

    // compute euclidean distance and match threshold
    const dist = euclidean(baseDesc, newDesc);
    const threshold = parseFloat(process.env.FACE_MATCH_THRESHOLD || "0.55");
    const matched = dist <= threshold;

    // Save verification flag on user (do not overwrite stored profileDescriptorEncrypted here)
    user.profileVerified = matched;
    await user.save();

    return res.json({ matched, dist });
  } catch (err) {
    console.error("❌ compareProfileDescriptor error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

exports.cookieOptions = function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
};
