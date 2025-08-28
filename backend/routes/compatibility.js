const express = require("express");
const router = express.Router();
const Compatibility = require("../models/compatibility");
const { calculateCompatibility, interpretScore } = require("../utils/compatibilityCalculator");
const { protect } = require("../middleware/auth");

// Save or update compatibility answers
router.post("/submit", protect, async (req, res) => {
  try {
    const { answers, dealbreakers } = req.body;

    // ✅ Always use user ID from token
    const userId = req.user._id;

    let existing = await Compatibility.findOne({ user: userId });

    if (existing) {
      existing.answers = answers;
      existing.dealbreakers = dealbreakers;
      await existing.save();
      return res.json({ message: "Compatibility form updated" });
    }

    const newForm = new Compatibility({ user: userId, answers, dealbreakers });
    await newForm.save();

    res.json({ message: "Compatibility form saved" });
  } catch (err) {
    console.error("❌ Error saving compatibility form:", err.message);
    res.status(500).json({ error: err.message });
  }
});




// Calculate compatibility between two users
router.get("/match/:userA/:userB", async (req, res) => {
  try {
    const { userA, userB } = req.params;
    const formA = await Compatibility.findOne({ user: userA });
    const formB = await Compatibility.findOne({ user: userB });

    if (!formA || !formB) {
      return res.status(404).json({ error: "One or both users have not filled the form" });
    }

    const score = calculateCompatibility(formA, formB);
    const interpretation = interpretScore(score);

    res.json({ compatibility: (score * 100).toFixed(1), interpretation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
