const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const matcher = require("../utils/compatibilityMatcher");
const PersonalityReport = require("../models/PersonalityReport");
const CompatibilityCache = require("../models/CompatibilityCache");
const User = require("../models/User");
const Profile = require("../models/Profile");

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
        (bigFive[dimension] / counts[dimension]) * 20
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
      report2.bigFive
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
        (c) => c.dimension || c
      ),
      complementaryTraits: result.details.complementaryTraits,
      potentialConflicts: result.details.potentialConflicts.map(
        (p) => p.issue || p
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
// ✨ NOW WITH EMAIL DOMAIN + OPPOSITE GENDER FILTERING ✨
// ============================================================================
router.get("/all-matches", protect, async (req, res) => {
  try {
    console.log("🔍 Fetching all matches for user:", req.user._id);

    const userId = req.user._id;

    // Step 1: Get current user details (need gender & emailDomain)
    const currentUser = await User.findById(userId);
    const premiumUser = isUserPremium(currentUser);

    if (!currentUser) {
      console.error("❌ Current user not found:", userId);
      return res.status(404).json({ error: "User not found" });
    }
    console.log("✅ Current user found:", {
      name: currentUser.name,
      gender: currentUser.gender,
      emailDomain: currentUser.emailDomain,
    });

    // Step 2: Get current user's personality report
    const myReport = await PersonalityReport.findOne({ userId });
    if (!myReport) {
      console.warn("⚠️ No report found for user:", userId);
      return res.status(404).json({
        error: "Please complete personality assessment first",
      });
    }
    console.log("✅ Current user report found");

    // Step 3: Build opposite gender filter
    const genderFilter = getOppositeGenderFilter(currentUser.gender);
    console.log("🔍 Gender filter:", genderFilter);

    // ✅ Step 4: Build DOMAIN FILTER (Same email domain)
    const domainFilter = {
      emailDomain: currentUser.emailDomain,
    };
    console.log("🎓 Domain filter:", domainFilter);

    // ✅ Step 5: Get all other users from SAME DOMAIN with opposite gender
    let otherReports = await PersonalityReport.find({
      userId: { $ne: userId },
    })
      .populate({
        path: "userId",
        select: "_id gender emailDomain",
        model: "User",
        match: {
          ...genderFilter, // Opposite gender
          ...domainFilter, // ✅ Same email domain
        },
      })
      .lean();

    console.log(
      "✅ Found",
      otherReports.length,
      "other reports (before filtering)"
    );

    // Step 6: Defensive filtering: keep only reports where userId is populated
    otherReports = otherReports.filter((report) => report.userId != null);
    console.log(
      "✅ After filtering null userId:",
      otherReports.length,
      "reports"
    );

    if (otherReports.length === 0) {
      console.warn("⚠️ No users found with same domain and opposite gender");
      return res.json({
        success: true,
        matches: [],
        total: 0,
        userGender: currentUser.gender,
        userEmailDomain: currentUser.emailDomain,
        message: `No ${
          normalizeGender(currentUser.gender) === "male" ? "female" : "male"
        } users found from your college (${currentUser.emailDomain})`,
      });
    }

    // Step 7: Get profiles for valid user IDs
    const userIds = otherReports.map((report) => report.userId._id);
    const profiles = await Profile.find({ user: { $in: userIds } })
      .select(
        "user name age gender bio profilePic interests branch course year location preference"
      )
      .lean();

    console.log("✅ Found", profiles.length, "profiles");

    // Step 8: Map profiles by userId for quick lookup
    const profileMap = new Map();
    profiles.forEach((profile) => {
      if (profile.user) {
        profileMap.set(profile.user.toString(), profile);
      }
    });

    // Step 9: Merge profiles into reports and filter valid
    const validReports = otherReports
      .map((report) => ({
        ...report,
        profile: profileMap.get(report.userId._id.toString()) || null,
      }))
      .filter((report) => {
        if (!report.profile) {
          console.warn(
            "⚠️ Report missing profile for userId:",
            report.userId._id
          );
          return false;
        }
        if (!report.bigFive) {
          console.warn(
            "⚠️ Report missing bigFive for userId:",
            report.userId._id
          );
          return false;
        }
        if (!report.profile.name) {
          console.warn(
            "⚠️ Profile missing name for userId:",
            report.userId._id
          );
          return false;
        }
        return true;
      });

    console.log(`✅ Valid reports after filtering: ${validReports.length}`);

    if (validReports.length === 0) {
      console.warn("⚠️ No valid opposite gender users found from same domain");
      return res.json({
        success: true,
        matches: [],
        total: 0,
        userGender: currentUser.gender,
        userEmailDomain: currentUser.emailDomain,
        message: `No ${
          normalizeGender(currentUser.gender) === "male" ? "female" : "male"
        } users found from your college (${currentUser.emailDomain})`,
      });
    }

    // Step 10: Score matches
    const scoredMatches = matcher.scoreAllMatches(
      myReport.bigFive,
      validReports
    );
    console.log(`✅ Scored ${scoredMatches.length} matches`);

    // Step 11: Format matches with profiles
    const topMatches = scoredMatches
      .slice(0, 50)
      .map((match, idx) => {
        try {
          const { profile } = match;
          const userId = match.userId._id || match.userId;

        return {
  userId: userId.toString(),
  name: profile.name || "Unknown User",
  age: profile.age || null,
  gender: profile.gender || null,
  bio: profile.bio || "",
  profilePic: profile.profilePic || null,
  interests: profile.interests || [],
  branch: profile.branch || null,
  course: profile.course || null,
  year: profile.year || null,
  location: profile.location || null,
  preference: profile.preference || "Any",
  emailDomain: match.userId.emailDomain || null,
  compatibility: Math.round(match.compatibility) || 0,
  category: matcher.categorizeMatch
    ? matcher.categorizeMatch(match.compatibility)
    : "Unknown",
  interpretation: match.interpretation || "Compatible match",
  strengths: (match.details?.strengthAreas || []).slice(0, 2),
  challenges: (match.details?.challengeAreas || []).slice(0, 2),

  // 🔒 ADD THIS
  isLocked: !premiumUser && idx >= 2,
};


        } catch (e) {
          console.error(`❌ Error formatting match #${idx}`, e);
          return null;
        }
      })
      .filter((m) => m !== null);

    console.log(
      `✅ Successfully formatted ${topMatches.length} matches for response`
    );
    console.log(
      `📊 All matches from domain: ${currentUser.emailDomain}`,
      topMatches.map((m) => ({ name: m.name, domain: m.emailDomain }))
    );

    res.json({
      success: true,
      isPremium: premiumUser,
      matches: topMatches,
      total: topMatches.length,
      userGender: currentUser.gender,
      userEmailDomain: currentUser.emailDomain,
      message: `Found ${topMatches.length} compatible ${
        normalizeGender(currentUser.gender) === "male" ? "female" : "male"
      } matches from your college`,
    });
  } catch (err) {
    console.error("❌ Error in all-matches:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch matches: " + err.message });
  }
});

// GET: Get matches filtered by compatibility range
router.get("/matches-by-range", protect, async (req, res) => {
  try {
    const { minCompat = 50, maxCompat = 100 } = req.query;
    const userId = req.user._id;

    // Get current user and their gender & emailDomain
    const currentUser = await User.findById(userId);
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
      validReports
    );

    const filtered = scoredMatches.filter(
      (m) => m.compatibility >= minCompat && m.compatibility <= maxCompat
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

router.get("/debug/all-matches-debug", protect, async (req, res) => {
  try {
    console.log("🔍 DEBUG: Starting all-matches debug");
    const userId = req.user._id;
    console.log("✅ Got userId:", userId);

    // Get current user
    const currentUser = await User.findById(userId);
    console.log("✅ Current user gender:", currentUser?.gender);
    console.log("✅ Current user emailDomain:", currentUser?.emailDomain); // ✅ Debug domain

    // Get current user's personality report
    const myReport = await PersonalityReport.findOne({ userId });
    console.log("✅ Got myReport:", !!myReport);
    console.log("   - Has bigFive:", !!myReport?.bigFive);
    console.log("   - BigFive scores:", myReport?.bigFive);

    if (!myReport) {
      return res.status(404).json({ error: "No report found" });
    }

    // Get opposite gender filter
    const genderFilter = getOppositeGenderFilter(currentUser?.gender);
    console.log("🔍 Gender filter:", genderFilter);

    // ✅ Get domain filter
    const domainFilter = { emailDomain: currentUser?.emailDomain };
    console.log("🎓 Domain filter:", domainFilter);

    // Get all other users' reports WITH gender filter AND domain filter
    console.log("🔍 Fetching all other reports with gender + domain filters...");
    const otherReports = await PersonalityReport.find({
      userId: { $ne: userId },
    })
      .populate({
        path: "userId",
        model: "User",
        match: {
          ...genderFilter,
          ...domainFilter, // ✅ Add domain filter
        },
        select: "name gender emailDomain",
      })
      .lean();

    console.log("✅ Found", otherReports.length, "other reports");

    // Filter nulls
    const validReports = otherReports.filter((r) => r.userId != null);
    console.log(
      "✅ After filtering null userId:",
      validReports.length,
      "reports"
    );

    // Check structure of first report
    if (validReports.length > 0) {
      console.log("📋 First report structure:", {
        userId: validReports[0].userId,
        emailDomain: validReports[0].userId?.emailDomain,
        hasBigFive: !!validReports[0].bigFive,
        bigFiveKeys: validReports[0].bigFive
          ? Object.keys(validReports[0].bigFive)
          : "N/A",
      });
    }

    // Check if matcher exists
    console.log("🔍 Checking matcher...");
    console.log("✅ Matcher functions:", {
      hasScoreAllMatches: typeof matcher.scoreAllMatches,
      hasCategorizeMatch: typeof matcher.categorizeMatch,
    });

    res.json({
      success: true,
      debug: {
        currentUserGender: currentUser?.gender,
        currentUserEmailDomain: currentUser?.emailDomain,
        genderFilter: genderFilter,
        domainFilter: domainFilter,
        userFound: !!myReport,
        otherReportsCount: otherReports.length,
        validReportsCount: validReports.length,
        firstValidReportUserId: validReports[0]?.userId,
        firstValidReportDomain: validReports[0]?.userId?.emailDomain,
        myReportBigFive: myReport.bigFive,
      },
    });
  } catch (err) {
    console.error("❌ Debug error:", {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
    res.status(500).json({
      error: err.message,
      type: err.name,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
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
      otherReport.bigFive
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
