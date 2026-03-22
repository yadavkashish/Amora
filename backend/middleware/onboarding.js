const User = require("../models/User");

const onboardingCheck = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.onboardingCompleted) {
      return res.status(403).json({
        error: "Complete your profile first",
      });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: "Onboarding check failed" });
  }
};

module.exports = onboardingCheck;