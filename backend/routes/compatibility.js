const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const matcher = require("../utils/compatibilityMatcher");
const PersonalityReport = require("../models/PersonalityReport");
const CompatibilityCache = require("../models/CompatibilityCache");
const User = require("../models/User");
const Profile = require("../models/Profile");
const Chat = require("../models/Chat");

// ============================================================================
// HELPER: Normalize gender for consistent comparison
// ============================================================================
function normalizeGender(gender) {
  if (!gender) return "";
  const normalized = String(gender).trim().toLowerCase();
  if (normalized === "m" || normalized === "male") return "male";
  if (normalized === "f" || normalized === "female") return "female";
  if (normalized === "other") return "other";
  return normalized;
}

function isUserPremium(user) {
  return (
    user?.isPremium &&
    user?.subscriptionExpiry &&
    new Date(user.subscriptionExpiry) > new Date()
  );
}

// ============================================================================
// HELPER: Get opposite gender filter query
// ============================================================================
function getOppositeGenderFilter(userGender) {
  const normalized = normalizeGender(userGender);

  if (normalized === "male") {
    return { gender: { $in: ["Female", "female", "F", "f"] } };
  } else if (normalized === "female") {
    return { gender: { $in: ["Male", "male", "M", "m"] } };
  } else if (normalized === "other") {
    return { gender: { $nin: ["Other", "other"] } };
  }

  return {};
}

// POST: Submit compatibility answers
router.post("/submit", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { answers, dealbreakers, timeSpent, totalTimeSpent, completedAt } =
      req.body;

    if (!answers || Object.keys(answers).length === 0) {
      return res.status(400).json({ error: "No answers provided" });
    }

    const bigFiveScores = calculateBigFiveScores(answers);

    let report = await PersonalityReport.findOne({ userId });

    if (report) {
      report.bigFive = bigFiveScores;
      report.rawAnswers = answers;
      report.dealbreakers = dealbreakers;
      report.timeSpent = timeSpent;
      report.totalTimeSpent = totalTimeSpent;
      report.completedAt = completedAt;
      report.updatedAt = new Date();
    } else {
      report = new PersonalityReport({
        userId,
        bigFive: bigFiveScores,
        rawAnswers: answers,
        dealbreakers: dealbreakers,
        timeSpent: timeSpent,
        totalTimeSpent: totalTimeSpent,
        completedAt: completedAt,
      });
    }

    await report.save();

    res.status(201).json({
      message: "Answers saved successfully",
      submitted: true,
      bigFive: bigFiveScores,
      reportId: report._id,
      completedAt: report.completedAt,
    });
  } catch (err) {
    console.error("❌ Error saving compatibility answers:", err);
    res.status(500).json({ error: err.message });
  }
});

// Helper function to calculate Big Five from answers
function calculateBigFiveScores(answers) {
  const bigFive = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0,
  };

  const dimensionMap = {
    1: "openness",
    2: "openness",
    3: "openness",
    4: "openness",
    5: "openness",
    6: "conscientiousness",
    7: "conscientiousness",
    8: "conscientiousness",
    9: "conscientiousness",
    10: "conscientiousness",
    11: "extraversion",
    12: "extraversion",
    13: "extraversion",
    14: "extraversion",
    15: "extraversion",
    16: "agreeableness",
    17: "agreeableness",
    18: "agreeableness",
    19: "agreeableness",
    20: "agreeableness",
    21: "neuroticism",
    22: "neuroticism",
    23: "neuroticism",
    24: "neuroticism",
    25: "neuroticism",
  };

  const counts = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0,
  };

  Object.entries(answers).forEach(([questionId, score]) => {
    const dimension = dimensionMap[parseInt(questionId)];
    if (dimension) {
      bigFive[dimension] += score;
      counts[dimension]++;
    }
  });

  Object.keys(bigFive).forEach((dimension) => {
    if (counts[dimension] > 0) {
      bigFive[dimension] = Math.round(
        (bigFive[dimension] / counts[dimension]) * 20,
      );
    }
  });

  return bigFive;
}

// GET: Calculate compatibility between two users
router.get("/match/:user1Id/:user2Id", protect, async (req, res) => {
  try {
    const { user1Id, user2Id } = req.params;

    let cached = await CompatibilityCache.findOne({
      $or: [
        { user1Id, user2Id },
        { user1Id: user2Id, user2Id: user1Id },
      ],
    });

    if (cached && new Date() < cached.expiresAt) {
      return res.json({
        compatibility: cached.compatibility,
        interpretation: cached.interpretation,
        category: cached.category,
        details: {
          strengthAreas: cached.strengthAreas,
          challengeAreas: cached.challengeAreas,
          complementaryTraits: cached.complementaryTraits,
          potentialConflicts: cached.potentialConflicts,
        },
      });
    }

    const report1 = await PersonalityReport.findOne({ userId: user1Id });
    const report2 = await PersonalityReport.findOne({ userId: user2Id });

    if (!report1 || !report2) {
      return res.status(404).json({
        error: "One or both users have not completed personality assessment",
      });
    }

    const result = matcher.calculateCompatibility(
      report1.bigFive,
      report2.bigFive,
    );
    const weighted = matcher.calculateWeightedCompatibility(report1, report2);
    const category = matcher.categorizeMatch
      ? matcher.categorizeMatch(weighted)
      : "Unknown";

    const compatibility = new CompatibilityCache({
      user1Id,
      user2Id,
      compatibility: weighted,
      weightedCompatibility: weighted,
      breakdown: result.breakdown,
      strengthAreas: result.details.strengthAreas.map((s) => s.dimension || s),
      challengeAreas: result.details.challengeAreas.map(
        (c) => c.dimension || c,
      ),
      complementaryTraits: result.details.complementaryTraits,
      potentialConflicts: result.details.potentialConflicts.map(
        (p) => p.issue || p,
      ),
      interpretation: result.interpretation,
      category,
    });

    await compatibility.save();

    res.json({
      compatibility: weighted,
      interpretation: result.interpretation,
      category,
      details: result.details,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// GET: Get all matches for current user (sorted by compatibility)
// ✨ FIXED + OPTIMIZED VERSION ✨
// ============================================================================
// ============================================================================
// GET: Get all matches for current user (sorted by compatibility)
// FULL SAFE VERSION (Geo + Privacy + Compatibility)
// ============================================================================
router.get("/all-matches", protect, async (req, res) => {
  try {
    console.log("🔍 Fetching all matches for user:", req.user._id);

    const userId = req.user._id;

    // ------------------------------------------------------------------
    // STEP 1 — Current User + Profile
    // ------------------------------------------------------------------
    const currentUser = await User.findOne({
      _id: userId,
      deleted: false,
    });

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const premiumUser = isUserPremium(currentUser);

    const myProfile = await Profile.findOne({ user: userId });

    console.log("🎯 Current User:", {
      name: currentUser.name,
      gender: currentUser.gender,
      domain: currentUser.emailDomain,
      privacy: currentUser.privacy,
    });

    // ------------------------------------------------------------------
    // STEP 2 — Personality Report
    // ------------------------------------------------------------------
    const myReport = await PersonalityReport.findOne({ userId });

    if (!myReport) {
      return res.status(404).json({
        error: "Please complete personality assessment first",
      });
    }

    console.log("🧠 Personality report found");

    // ------------------------------------------------------------------
    // STEP 3 — Gender Filter
    // ------------------------------------------------------------------
    const genderFilter = getOppositeGenderFilter(currentUser.gender);

    // ------------------------------------------------------------------
    // STEP 4 — Domain / Privacy Visibility Logic
    // ------------------------------------------------------------------
   const isGmail = currentUser.emailDomain === "gmail.com";
const userDomain = currentUser.emailDomain;

// ⭐ IMPORTANT FIX
// Gmail users are ALWAYS public
const effectivePrivacy = isGmail
  ? "public"
  : currentUser.privacy;

const isPublic = effectivePrivacy === "public";

    let domainMatchCondition = {};

if (isGmail) {
  // Gmail users always behave as public
  domainMatchCondition = {
    $or: [
      { privacy: "public" },
      { emailDomain: "gmail.com" },
    ],
  };
} else {
  if (isPublic) {
    // Public college user
    domainMatchCondition = {
      $or: [
        { privacy: "public" },
        { emailDomain: userDomain },
      ],
    };
  } else {
    // Private college user
    domainMatchCondition = {
      emailDomain: userDomain,
    };
  }
}

    console.log("🎓 Domain condition:", domainMatchCondition);

    // ------------------------------------------------------------------
    // STEP 5 — Fetch Other Personality Reports
    // ------------------------------------------------------------------
    let otherReports = await PersonalityReport.find({
      userId: { $ne: userId },
    })
      .populate({
        path: "userId",
        model: "User",
        select: "_id gender emailDomain privacy deleted",
        match: {
          deleted: false,
          ...genderFilter,
          ...domainMatchCondition,
        },
      })
      .lean();

    // remove null populated users
    otherReports = otherReports.filter((r) => r.userId !== null);

    console.log("📌 Valid reports:", otherReports.length);

    if (otherReports.length === 0) {
      return res.json({
        success: true,
        matches: [],
        isPremium: premiumUser,
        total: 0,
      });
    }

    // ------------------------------------------------------------------
    // STEP 6 — Load Profiles (Geo if available)
    // ------------------------------------------------------------------
    const otherUserIds = otherReports.map((r) => r.userId._id);

    const hasLocation =
      myProfile?.currentLocation?.coordinates &&
      myProfile.currentLocation.coordinates.length === 2;

    let profiles = [];

    if (hasLocation) {
      profiles = await Profile.aggregate([
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: myProfile.currentLocation.coordinates,
            },
            distanceField: "distance",
            spherical: true,
            key: "currentLocation",
            query: {
              user: { $in: otherUserIds },
            },
          },
        },
      ]);
    } else {
      // fallback if location not available
      profiles = await Profile.find({
        user: { $in: otherUserIds },
      }).lean();
    }

    // ------------------------------------------------------------------
    // STEP 7 — Map Profiles to Reports
    // ------------------------------------------------------------------
    const profileMap = new Map();

    profiles.forEach((p) => {
      profileMap.set(p.user.toString(), p);
    });

    otherReports.forEach((r) => {
      r.profile = profileMap.get(r.userId._id.toString()) || null;
    });

    // ------------------------------------------------------------------
    // STEP 8 — Score Matches (Compatibility Engine)
    // ------------------------------------------------------------------
    const scoredMatches = matcher.scoreAllMatches(
      myReport.bigFive,
      otherReports
    );

    // attach profile safely
    scoredMatches.forEach((m) => {
      const original = otherReports.find(
        (o) => o.userId._id.toString() === m.userId._id.toString()
      );
      m.profile = original?.profile || null;
    });

    // ------------------------------------------------------------------
    // STEP 9 — Format Final Response
    // ------------------------------------------------------------------
    const topMatches = await Promise.all(
      scoredMatches.slice(0, 50).map(async (match, idx) => {
        const p = match.profile || {};

        // chat status
        let chatStatus = "NONE";

        const chatMeta = await Chat.findOne({
          participants: { $all: [userId, match.userId._id] },
        });

        if (chatMeta) chatStatus = chatMeta.status;

        return {
          userId: match.userId._id.toString(),

          name: p.name,
          age: p.age,
          gender: p.gender,
          bio: p.bio,
          profilePic: p.profilePic,
          interests: p.interests || [],
          course: p.course || null,
          year: p.year || null,
          location: p.location || null,
          preference: p.preference || "Any",

          emailDomain: match.userId.emailDomain,
          privacy: match.userId.privacy,

          // distance in meters (null if no geo)
          distance: p.distance || null,

          chatStatus,

          compatibility: Math.round(match.compatibility),
          strengths: (match.details?.strengthAreas || []).slice(0, 2),
          challenges: (match.details?.challengeAreas || []).slice(0, 2),

          // premium lock logic
          isLocked: !premiumUser && idx >= 2,
        };
      })
    );

    console.log("✅ FINAL MATCH COUNT:", topMatches.length);

    // ------------------------------------------------------------------
    // STEP 10 — Response
    // ------------------------------------------------------------------
    return res.json({
      success: true,
      matches: topMatches,
      isPremium: premiumUser,
      total: topMatches.length,
    });
  } catch (err) {
    console.error("❌ Error in all-matches:", err);
    return res.status(500).json({
      error: "Failed to fetch matches: " + err.message,
    });
  }
});

// GET: Get matches filtered by compatibility range
router.get("/matches-by-range", protect, async (req, res) => {
  try {
    const { minCompat = 50, maxCompat = 100 } = req.query;
    const userId = req.user._id;

    // Get current user and their gender & emailDomain
    const currentUser = await User.findOne({ _id: userId, deleted: false });

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get opposite gender filter
    const genderFilter = getOppositeGenderFilter(currentUser.gender);

    // ✅ Get domain filter
    const domainFilter = {
      emailDomain: currentUser.emailDomain,
    };

    const myReport = await PersonalityReport.findOne({ userId });

    if (!myReport) {
      return res.status(404).json({
        error: "Please complete personality assessment first",
      });
    }

    // ✅ Apply both gender AND domain filters
    const otherReports = await PersonalityReport.find({
      userId: { $ne: userId },
    })
      .populate({
        path: "userId",
        model: "User",
        match: {
          deleted: false,
          ...genderFilter,
          ...domainFilter, // ✅ Add domain filter
        },
        select: "name age gender bio profilePic emailDomain",
      })
      .lean();

    // Filter out null userId from populate
    const validReports = otherReports.filter((r) => r.userId != null);

    const scoredMatches = matcher.scoreAllMatches(
      myReport.bigFive,
      validReports,
    );

    const filtered = scoredMatches.filter(
      (m) => m.compatibility >= minCompat && m.compatibility <= maxCompat,
    );

    const results = filtered.map((match) => ({
      userId: match.userId._id,
      name: match.userId.name,
      age: match.userId.age,
      gender: match.userId.gender,
      emailDomain: match.userId.emailDomain, // ✅ Include domain
      compatibility: match.compatibility,
      category: matcher.categorizeMatch(match.compatibility),
      interpretation: match.interpretation,
    }));

    res.json({
      matches: results,
      count: results.length,
      userEmailDomain: currentUser.emailDomain,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Get compatibility details between two users
router.get("/details/:otherUserId", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.params;

    const myReport = await PersonalityReport.findOne({ userId });
    const otherReport = await PersonalityReport.findOne({
      userId: otherUserId,
    });

    if (!myReport || !otherReport) {
      return res.status(404).json({
        error: "One or both users have not completed assessment",
      });
    }

    const result = matcher.calculateCompatibility(
      myReport.bigFive,
      otherReport.bigFive,
    );

    res.json({
      myProfile: {
        type: myReport.personalityProfile,
        scores: myReport.bigFive,
      },
      otherProfile: {
        type: otherReport.personalityProfile,
        scores: otherReport.bigFive,
      },
      compatibility: result.compatibility,
      interpretation: result.interpretation,
      breakdown: result.breakdown,
      analysis: result.details,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function orderedPair(id1, id2) {
  const s1 = id1.toString();
  const s2 = id2.toString();
  return s1 < s2 ? { a: s1, b: s2 } : { a: s2, b: s1 };
}

router.get("/status", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const report = await PersonalityReport.findOne({ userId });

    if (!report) {
      return res.json({ submitted: false });
    }

    return res.json({
      submitted: true,
      completedAt: report.completedAt || report.updatedAt || report.createdAt,
      reportId: report._id,
    });
  } catch (err) {
    console.error("❌ Error checking compatibility status:", err);
    res.status(500).json({ error: "Failed to check status" });
  }
});

router.post("/retake", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const removed = await PersonalityReport.findOneAndDelete({ userId });
    await CompatibilityCache.deleteMany({
      $or: [{ user1Id: userId }, { user2Id: userId }],
    });

    return res.json({
      success: true,
      message:
        "Your report and related compatibility cache entries were removed. You may retake the assessment.",
      removedReportId: removed ? removed._id : null,
    });
  } catch (err) {
    console.error("❌ Error during retake:", err);
    res.status(500).json({ error: "Failed to clear report / cache" });
  }
});

module.exports = router;
