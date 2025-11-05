const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PersonalityReport = require('../models/PersonalityReport');
const personalityCalculator = require('../utils/personalityCalculator');
const PersonalityReportGenerator = require('../utils/reportGenerator');
const reportGenerator = new PersonalityReportGenerator(personalityCalculator);

// POST: Generate personality report
router.post('/generate', auth, async (req, res) => {
  try {
    const { answers } = req.body;

    // Calculate scores
    const bigFive = personalityCalculator.calculateBigFive(answers);
    const enneagramType = personalityCalculator.calculateEnneagramType(bigFive, answers);
    const personalityProfile = personalityCalculator.getPersonalityType(bigFive);

    // Generate detailed report
    const detailedReport = reportGenerator.generateDetailedReport(
      answers,
      bigFive,
      enneagramType,
      personalityProfile
    );

    // Save to database
    const report = await PersonalityReport.findOneAndUpdate(
      { userId: req.user.id },
      {
        userId: req.user.id,
        answers,
        bigFive,
        enneagramType,
        personalityProfile,
        insights: detailedReport.detailedInsights,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      report: {
        personalityProfile,
        detailedReport,
        scores: bigFive
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Retrieve user's personality report
router.get('/my-report', auth, async (req, res) => {
  try {
    const report = await PersonalityReport.findOne({ userId: req.user.id });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Regenerate detailed report for display
    const detailedReport = reportGenerator.generateDetailedReport(
      report.answers,
      report.bigFive,
      report.enneagramType,
      report.personalityProfile
    );

    res.json({
      report: {
        personalityProfile: report.personalityProfile,
        detailedReport,
        scores: report.bigFive
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Get compatibility with another user
router.get('/compatibility/:otherUserId', auth, async (req, res) => {
  try {
    const userReport = await PersonalityReport.findOne({ userId: req.user.id });
    const otherReport = await PersonalityReport.findOne({ userId: req.params.otherUserId });

    if (!userReport || !otherReport) {
      return res.status(404).json({ error: 'One or both reports not found' });
    }

    // Calculate compatibility score
    const compatibility = calculateCompatibility(userReport.bigFive, otherReport.bigFive);

    res.json({
      compatibility,
      userProfile: userReport.personalityProfile,
      otherProfile: otherReport.personalityProfile,
      recommendation: getCompatibilityRecommendation(compatibility)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function calculateCompatibility(bigFive1, bigFive2) {
  // Calculate similarity in key dimensions
  const dims = ['openness', 'conscientiousness', 'extraversion', 'agreeableness'];
  let totalDifference = 0;

  dims.forEach(dim => {
    totalDifference += Math.abs(bigFive1[dim] - bigFive2[dim]);
  });

  const avgDifference = totalDifference / dims.length;
  const compatibility = 100 - avgDifference;

  return Math.round(compatibility);
}

function getCompatibilityRecommendation(score) {
  if (score > 80) return 'Excellent match! Very similar personality styles.';
  if (score > 60) return 'Good compatibility. You complement each other well.';
  if (score > 40) return 'Moderate compatibility. Communication is key.';
  return 'Different personalities. Growth opportunity through understanding differences.';
}

module.exports = router;