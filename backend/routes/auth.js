const express = require("express");
const router = express.Router();
const {
  sendOtp,
  verifyOtpAndRegister,
  login,
  forgotPassword,
  resetPassword,
  compareProfileDescriptor, // new controller export
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { otpLimiter, loginLimiter } = require("../middleware/rateLimiter");
const User = require("../models/User");

// OTP Routes with limiter
router.post("/send-otp", otpLimiter, sendOtp);
router.post("/verify-otp", verifyOtpAndRegister);
router.post("/forgot-password", otpLimiter, forgotPassword);
router.post("/reset-password", resetPassword);

// GET user by ID (for View Profile)
router.get("/user/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "name age gender bio interests profilePic emailDomain"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});


// Login route with limiter
router.post("/login", loginLimiter, login);

// Logout
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ message: "Logged out successfully" });
});

// ✅ Current logged-in user
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// ✅ All users from SAME DOMAIN except current user
router.get("/all-users", protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

    if (!currentUser) {
      return res.status(404).json({ error: "Current user not found" });
    }

    // ✅ Filter users by same domain, excluding current user
    const users = await User.find({
      _id: { $ne: req.user._id },
      emailDomain: currentUser.emailDomain, // ✅ Only same college/domain
    }).select("-password");

    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/**
 * POST /api/auth/compare-profile-descriptor
 * Protected route — client should compute profile descriptor (face-api.js) and POST it.
 * Body: { profileDescriptor: [ ... ] }
 * Response: { matched: boolean, dist: number }
 */
router.post("/compare-profile-descriptor", protect, compareProfileDescriptor);

module.exports = router;
