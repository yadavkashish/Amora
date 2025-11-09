const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// ✅ Fetch all users from same domain
router.get('/all', protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ Filter by same email domain
    const users = await User.find({
      _id: { $ne: req.user._id },
      emailDomain: currentUser.emailDomain
    }).select("-password");
    
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

module.exports = router;
