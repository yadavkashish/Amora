const express = require("express");
const router = express.Router();
const Personality = require("../models/personality");
const {
  calculatePersonalityScores,
  generatePersonalityReport,
} = require("../utils/personalityCalculator");
const { protect } = require("../middleware/auth");

// ✅ Submit or update personality quiz
router.post("/submit", protect, async (req, res) => {
  try {
    const { answers } = req.body;
    const userId = req.user._id;

    const scores = calculatePersonalityScores(answers);
    const report = generatePersonalityReport(scores);

    let existing = await Personality.findOne({ user: userId });

    if (existing) {
      existing.answers = answers;
      existing.report = report;
      await existing.save();
    } else {
      const newForm = new Personality({ user: userId, answers, report });
      await newForm.save();
    }

    res.json({ message: "Personality report generated successfully", report });
  } catch (err) {
    console.error("❌ Error generating personality:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Fetch logged-in user's personality report (MUST BE ABOVE /:userId)
router.get("/report/me", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const data = await Personality.findOne({ user: userId });

    if (!data)
      return res.status(404).json({ error: "No personality report found" });

    res.json({ report: data.report });
  } catch (err) {
    console.error("❌ Error fetching personality report:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Fetch report for any specific user
router.get("/:userId", async (req, res) => {
  try {
    const data = await Personality.findOne({ user: req.params.userId });
    if (!data) return res.status(404).json({ error: "No personality report found" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
