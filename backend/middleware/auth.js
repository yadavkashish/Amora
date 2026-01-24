const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: "Not authorized, token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");

    // if (!req.user) {
    //   return res.status(401).json({ error: "Not authenticated" });
    // }

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.deleted === true) {
      return res.status(410).json({ error: "Account deleted" });
    }

    req.user = user; // <-- THIS IS ENOUGH. DO NOT MODIFY req.user again.

    next();
  } catch (err) {
    res.status(401).json({ error: "Not authorized", details: err.message });
  }
};
