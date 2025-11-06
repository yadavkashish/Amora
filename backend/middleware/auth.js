const jwt = require('jsonwebtoken');
const User = require('../models/User');


exports.protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    console.log('🔍 Auth Check:');
    console.log('  - Available cookies:', Object.keys(req.cookies));
    console.log('  - Token value:', token ? token.substring(0, 20) + '...' : 'NOT FOUND');

    if (!token) {
      return res.status(401).json({ error: 'Not authorized, token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    req.user._id = user._id;

    console.log('✅ Auth successful for:', user.email);
    next();
  } catch (err) {
    console.error('❌ Auth error:', err.message);
    res.status(401).json({ error: 'Not authorized', details: err.message });
  }
};

