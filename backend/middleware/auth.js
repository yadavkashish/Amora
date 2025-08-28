const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    // ✅ Directly extract from cookies (not Authorization header)
    const token = req.cookies.token;

    if (!token) {
      console.log('❌ Token missing from cookies');
      return res.status(401).json({ error: 'Not authorized, token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
if (!user) {
  return res.status(401).json({ error: 'User not found' });
}
req.user = user;
req.user.userId = user._id.toString(); // ✅ Add this line


    if (!req.user) {
      console.log('❌ User not found from token');
      return res.status(401).json({ error: 'User not found' });
    }

    console.log('✅ Authenticated User:', req.user.email);
    next();
  } catch (err) {
    console.error('❌ Auth error:', err.message);
    res.status(401).json({ error: 'Not authorized' });
  }
};
