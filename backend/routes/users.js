const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth'); // Correct middleware

// 🛠 Use 'protect' not 'requireAuth'
router.get('/all', protect, async (req, res) => {
  try {
    const users = await User.find(); // ✅ fetch all users including current
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

module.exports = router;
