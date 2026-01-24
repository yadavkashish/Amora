const express = require("express");
const router = express.Router();
const {
  sendOtp,
  verifyOtpAndRegister,
  login,
  cookieOptions,
  forgotPassword,
  resetPassword,
  compareProfileDescriptor, // new controller export
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { otpLimiter, loginLimiter } = require("../middleware/rateLimiter");
const User = require("../models/User");
const Profile = require("../models/Profile");
const PersonalityReport = require("../models/PersonalityReport");

// OTP Routes with limiter
router.post("/send-otp", otpLimiter, sendOtp);
router.post("/verify-otp", verifyOtpAndRegister);
router.post("/forgot-password", otpLimiter, forgotPassword);
router.post("/reset-password", resetPassword);

// GET user by ID (for View Profile)
router.get("/user/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "name age gender bio interests profilePic emailDomain",
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
  res.clearCookie("token", cookieOptions());

  // future-proof (won't hurt if unused)
  res.clearCookie("refreshToken", cookieOptions());
  res.clearCookie("connect.sid", { path: "/" });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

router.put("/privacy", protect, async (req, res) => {
  try {
    const { privacy } = req.body;

    if (!["public", "private"].includes(privacy)) {
      return res.status(400).json({ error: "Invalid privacy value" });
    }

    await User.findByIdAndUpdate(req.user._id, { privacy });

    res.json({ success: true, privacy });
  } catch (error) {
    res.status(500).json({ error: "Failed to update privacy" });
  }
});

// ✅ Current logged-in user
router.get("/me", protect, async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "name email gender privacy emailDomain profilePicURL deleted isPremium subscriptionExpiry",
  );

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

 if (user.deleted === true) {
  // clear dead token
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  return res.status(410).json({ error: "Account deleted" });
}


  res.json({ user });
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

router.delete("/delete-account", protect, async (req, res) => {
  const userId = req.user._id;

  try {
    // Delete Profile
    await Profile.deleteOne({ user: userId });

    // Delete Personality Report
    await PersonalityReport.deleteOne({ userId });

    // Hard delete user
    await User.findByIdAndDelete(userId);

    // Clear login token
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("❌ Delete error:", err);
    return res.status(500).json({ error: "Failed to delete account" });
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
