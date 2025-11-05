const express = require("express");
const router = express.Router();
const PersonalityReport = require("../models/PersonalityReport");
const PersonalityCalculator = require("../utils/personalityCalculator");
const AIReportGenerator = require("../services/aiReportGenerator");
const { protect } = require("../middleware/auth");

// ============================================
// POST: Save Quiz Answers
// ============================================
router.post("/submit", protect, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { answers } = req.body;
    if (!userId || !answers) {
      return res.status(400).json({ error: "Missing user or answers" });
    }

    let report = await PersonalityReport.findOne({ userId });
    if (!report) {
      report = new PersonalityReport({ userId });
    }
    report.answers = answers;
    await report.save();

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Error saving personality answers:", err);
    res.status(500).json({ error: "Failed to save answers" });
  }
});

// ============================================
// POST: Generate AI-Powered Report
// ============================================
router.post("/generate-report", protect, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Not authorized" });
    }

    let report = await PersonalityReport.findOne({ userId });

    if (
      !report ||
      !report.answers ||
      Object.keys(report.answers).length === 0
    ) {
      return res.status(404).json({
        error: "Please complete the personality quiz first",
        code: "NO_QUIZ_DATA",
      });
    }

    console.log("📝 Generating AI report for userId:", userId);

    if (!report.bigFive || Object.keys(report.bigFive).length === 0) {
      report.bigFive = PersonalityCalculator.calculateBigFive(
        Object.fromEntries(report.answers)
      );
    }

    if (!report.enneagramType) {
      report.enneagramType = PersonalityCalculator.calculateEnneagramType(
        report.bigFive,
        Object.fromEntries(report.answers)
      );
    }

    console.log("🤖 Calling AI service...");
    const aiReport = await AIReportGenerator.generateReport(
      report.bigFive,
      report.enneagramType,
      Object.fromEntries(report.answers),
      { userId: userId.toString() }
    );

    // ✅ FIXED: Use "local" instead of AI_PROVIDER
    report.aiGeneratedReport = {
      ...aiReport,
      generatedAt: new Date(),
      aiProvider: "local",
    };

    report.updatedAt = new Date();
    report.reportVersion = (report.reportVersion || 0) + 1;

    await report.save();

    console.log("✅ AI report generated and saved successfully");

    res.status(200).json({
      success: true,
      message: "Report generated successfully",
      report: report.aiGeneratedReport,
    });
  } catch (error) {
    console.error("❌ Error generating AI report:", error);
    res.status(500).json({
      error: "Failed to generate report: " + error.message,
    });
  }
});

// ============================================
// GET: Fetch Generated Report
// ============================================
router.get("/my-report", protect, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Not authorized" });
    }

    const report = await PersonalityReport.findOne({ userId });

    if (!report) {
      return res.status(404).json({
        error: "Report not found. Please complete the personality assessment.",
        code: "NO_REPORT",
      });
    }

    if (!report.aiGeneratedReport) {
      return res.status(400).json({
        error: "Report not yet generated. Please generate your report first.",
        code: "REPORT_NOT_GENERATED",
      });
    }

    const bigFive = report.bigFive || {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0,
    };

    const formattedReport = {
      personalityProfile: report.aiGeneratedReport.personalityType.name,

      detailedReport: {
        summary: {
          headline: report.aiGeneratedReport.personalityType.name,
          tagline: report.aiGeneratedReport.personalityType.description,
          description: report.aiGeneratedReport.personalityNarrative,
        },

        personalityNarrative: report.aiGeneratedReport.personalityNarrative,

        detailedInsights: {
          strengths: report.aiGeneratedReport.strengths || [],
          developmentAreas: report.aiGeneratedReport.developmentAreas || [],
          communicationStyle:
            report.aiGeneratedReport.communicationStyle || "No data available",
          stressResponse:
            report.aiGeneratedReport.stressResponse || "No data available",
          decisionMakingStyle:
            report.aiGeneratedReport.conflictResolutionStyle ||
            "No data available",
          workStyle: "No data available",
        },

        careerGuidance: {
          suggestedCareers: report.aiGeneratedReport.careerSuggestions || [],
          workEnvironment:
            "You thrive in environments that align with your values.",
          leadershipStyle:
            "You lead with authenticity and emotional intelligence.",
          teamRole: "Balanced Contributor",
        },

        relationshipInsights: {
          communicationNeeds:
            report.aiGeneratedReport.relationshipApproach ||
            "You value honest communication.",
          conflictStyle:
            report.aiGeneratedReport.conflictResolutionStyle ||
            "Balanced approach",
          intimacyPreference:
            report.aiGeneratedReport.intimacyPreference ||
            "You seek genuine connection.",
          partnerCompatibility:
            report.aiGeneratedReport.compatibleTypes.join(", ") ||
            "Compatible partners",
          idealPartnerProfile:
            report.aiGeneratedReport.idealPartnerProfile || "",
        },

        enneagramAnalysis: {
          type: report.enneagramType || "N/A",
          name: "Enneagram Type " + (report.enneagramType || "Unknown"),
          description: report.aiGeneratedReport.personalityNarrative,
        },

        actionItems: report.aiGeneratedReport.actionItems || [],
        dateIdeas: report.aiGeneratedReport.dateIdeas || [],
        conversationStarters:
          report.aiGeneratedReport.conversationStarters || [],
        redFlags: report.aiGeneratedReport.redFlags || [],
      },

      scores: bigFive,
    };

    res.status(200).json({
      success: true,
      report: formattedReport,
    });
  } catch (error) {
    console.error("❌ Error fetching report:", error);
    res.status(500).json({
      error: "Failed to fetch report: " + error.message,
    });
  }
});

// ============================================
// POST: Regenerate AI Report
// ============================================
router.post("/regenerate-report", protect, async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Not authorized" });
    }

    const report = await PersonalityReport.findOne({ userId });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    console.log("🔄 Regenerating AI report...");

    const aiReport = await AIReportGenerator.generateReport(
      report.bigFive,
      report.enneagramType,
      Object.fromEntries(report.answers)
    );

    // ✅ FIXED: Use "local" instead of AI_PROVIDER
    report.aiGeneratedReport = {
      ...aiReport,
      generatedAt: new Date(),
      aiProvider: "local",
    };

    report.reportVersion = (report.reportVersion || 0) + 1;
    report.updatedAt = new Date();

    await report.save();

    console.log("✅ Report regenerated successfully");

    res.status(200).json({
      success: true,
      message: "Report regenerated successfully",
      report: report.aiGeneratedReport,
    });
  } catch (error) {
    console.error("❌ Error regenerating report:", error);
    res.status(500).json({
      error: "Failed to regenerate report: " + error.message,
    });
  }
});

// GET personality report of a specific user by ID
router.get("/:userId", protect, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Not authorized" });
    }

    const report = await PersonalityReport.findOne({ userId });

    if (!report) {
      return res.status(404).json({
        error: "Report not found. Please complete the personality assessment.",
        code: "NO_REPORT",
      });
    }

    if (!report.aiGeneratedReport) {
      return res.status(400).json({
        error: "Report not yet generated. Please generate your report first.",
        code: "REPORT_NOT_GENERATED",
      });
    }

    const bigFive = report.bigFive || {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0,
    };

    const formattedReport = {
      personalityProfile: report.aiGeneratedReport.personalityType.name,

      detailedReport: {
        summary: {
          headline: report.aiGeneratedReport.personalityType.name,
          tagline: report.aiGeneratedReport.personalityType.description,
          description: report.aiGeneratedReport.personalityNarrative,
        },

        personalityNarrative: report.aiGeneratedReport.personalityNarrative,

        detailedInsights: {
          strengths: report.aiGeneratedReport.strengths || [],
          developmentAreas: report.aiGeneratedReport.developmentAreas || [],
          communicationStyle:
            report.aiGeneratedReport.communicationStyle || "No data available",
          stressResponse:
            report.aiGeneratedReport.stressResponse || "No data available",
          decisionMakingStyle:
            report.aiGeneratedReport.conflictResolutionStyle ||
            "No data available",
          workStyle: "No data available",
        },

        careerGuidance: {
          suggestedCareers: report.aiGeneratedReport.careerSuggestions || [],
          workEnvironment:
            "You thrive in environments that align with your values.",
          leadershipStyle:
            "You lead with authenticity and emotional intelligence.",
          teamRole: "Balanced Contributor",
        },

        relationshipInsights: {
          communicationNeeds:
            report.aiGeneratedReport.relationshipApproach ||
            "You value honest communication.",
          conflictStyle:
            report.aiGeneratedReport.conflictResolutionStyle ||
            "Balanced approach",
          intimacyPreference:
            report.aiGeneratedReport.intimacyPreference ||
            "You seek genuine connection.",
          partnerCompatibility:
            report.aiGeneratedReport.compatibleTypes.join(", ") ||
            "Compatible partners",
          idealPartnerProfile:
            report.aiGeneratedReport.idealPartnerProfile || "",
        },

        enneagramAnalysis: {
          type: report.enneagramType || "N/A",
          name: "Enneagram Type " + (report.enneagramType || "Unknown"),
          description: report.aiGeneratedReport.personalityNarrative,
        },

        actionItems: report.aiGeneratedReport.actionItems || [],
        dateIdeas: report.aiGeneratedReport.dateIdeas || [],
        conversationStarters:
          report.aiGeneratedReport.conversationStarters || [],
        redFlags: report.aiGeneratedReport.redFlags || [],
      },

      scores: bigFive,
    };

    res.status(200).json({
      success: true,
      report: formattedReport,
    });
  } catch (error) {
    console.error("❌ Error fetching report:", error);
    res.status(500).json({
      error: "Failed to fetch report: " + error.message,
    });
  }
});

// GET personality report of the currently authenticated user
router.get("/me", protect, async (req, res) => {
  try {
    // Defensive: protect should set req.user, but handle if it does not
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      console.warn("GET /api/personality/me called but req.user is missing");
      // 401 to tell client they are not authenticated
      return res.status(401).json({ error: "Not authorized" });
    }

    // Attempt to find report
    const report = await PersonalityReport.findOne({ userId }).lean();

    // If no report, return consistent shape (200 + null)
    if (!report) {
      console.info(`No PersonalityReport found for userId=${userId}`);
      return res.status(200).json({ report: null });
    }

    // Build normalized payload
    const normalized = {
      ...report.aiGeneratedReport,
      bigFive: report.bigFive ?? report.aiGeneratedReport?.bigFive ?? {},
      enneagramType:
        report.enneagramType ?? report.aiGeneratedReport?.enneagramType ?? null,
      _meta: {
        reportVersion: report.reportVersion,
        generatedAt: report.aiGeneratedReport?.generatedAt ?? report.updatedAt,
        userId: report.userId,
      },
    };

    return res.json({ report: normalized });
  } catch (err) {
    // Log full stack so we can see exactly where it failed
    console.error("❌ Error in GET /api/personality/me:", err.stack || err);
    return res
      .status(500)
      .json({ error: "Failed to fetch personality report" });
  }
});

module.exports = router;
