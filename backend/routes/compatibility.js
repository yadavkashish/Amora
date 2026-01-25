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
router.get("/all-matches", protect, async (req, res) => {
  try {
    console.log("🔍 Fetching all matches for user:", req.user._id);

    const userId = req.user._id;

    // STEP 1 — Current User
    const currentUser = await User.findOne({ _id: userId, deleted: false });
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    const premiumUser = isUserPremium(currentUser);

    console.log("🎯 Current User:", {
      name: currentUser.name,
      gender: currentUser.gender,
      domain: currentUser.emailDomain,
      privacy: currentUser.privacy,
    });

    // STEP 2 — Personality Report
    const myReport = await PersonalityReport.findOne({ userId });
    if (!myReport) {
      return res.status(404).json({
        error: "Please complete personality assessment first",
      });
    }
    console.log("🧠 Personality report found");

    // STEP 3 — Opposite Gender Filter
    const genderFilter = getOppositeGenderFilter(currentUser.gender);

    // STEP 4 — Domain Visibility Logic
    const isGmail = currentUser.emailDomain === "gmail.com";
    const userDomain = currentUser.emailDomain;
    const isPublic = currentUser.privacy === "public";

    let domainMatchCondition = {};

    if (isGmail) {
      if (isPublic)
        domainMatchCondition = {
          $or: [{ privacy: "public" }, { emailDomain: "gmail.com" }],
        };
      else domainMatchCondition = { emailDomain: "gmail.com" };
    } else {
      if (isPublic)
        domainMatchCondition = {
          $or: [{ emailDomain: userDomain }, { privacy: "public" }],
        };
      else domainMatchCondition = { emailDomain: userDomain };
    }

    console.log("🎓 Final domainMatchCondition:", domainMatchCondition);

    // STEP 5 — Fetch All Other Reports
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

    console.log("📌 Found reports:", otherReports.length);

    // Filter out null userId
    otherReports = otherReports.filter((r) => r.userId !== null);

    console.log("📌 Valid reports:", otherReports.length);

    if (otherReports.length === 0) {
      return res.json({
        success: true,
        matches: [],
        total: 0,
      });
    }

    // STEP 6 — Load Profiles
    for (let r of otherReports) {
      const profile = await Profile.findOne({ user: r.userId._id })
        .select(
          "name age gender bio profilePic interests branch course year location preference",
        )
        .lean();

      r.profile = profile || {
        name: "Unknown",
        age: null,
        gender: "Other",
        bio: "",
        profilePic: null,
        interests: [],
      };
    }

    // STEP 8 — Score Matches
    const scoredMatches = matcher.scoreAllMatches(
      myReport.bigFive,
      otherReports,
    );

    // ⭐ Attach profile back (fix the crash)
    scoredMatches.forEach((m) => {
      const original = otherReports.find(
        (o) => o.userId._id.toString() === m.userId._id.toString(),
      );
      m.profile = original.profile;
    });

    // STEP 9 — Format Output
    const topMatches = await Promise.all(
      scoredMatches.slice(0, 50).map(async (match, idx) => {
        const p = match.profile;

        // ⭐ FIX: compute chat status here
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
          branch: p.branch || null,
          course: p.course || null,
          year: p.year || null,
          location: p.location || null,
          preference: p.preference || "Any",

          emailDomain: match.userId.emailDomain,
          privacy: match.userId.privacy,

          chatStatus, // ⭐ NOW VALID

          compatibility: Math.round(match.compatibility),
          strengths: (match.details?.strengthAreas || []).slice(0, 2),
          challenges: (match.details?.challengeAreas || []).slice(0, 2),

          isLocked: !premiumUser && idx >= 2,
        };
      }),
    );

    console.log("✅ FINAL MATCH COUNT:", topMatches.length);

    // STEP 10 — Send Response
    res.json({
      success: true,
      matches: topMatches,
      isPremium: premiumUser,
      total: topMatches.length,
    });
  } catch (err) {
    console.error("❌ Error in all-matches:", err);
    res.status(500).json({
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

// ============================================================================
// GET: Get all matches for current user (sorted by compatibility)
// ============================================================================

router.get("/all-matches", protect, async (req, res) => {
  try {
    console.log("🔍 Fetching all matches for user:", req.user._id);

    const userId = req.user._id;

    // Step 1: Get current user
    const currentUser = await User.findOne({ _id: userId });

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const premiumUser = isUserPremium(currentUser);

    // Step 2: Get personality report
    const myReport = await PersonalityReport.findOne({ userId });
    if (!myReport) {
      return res.status(404).json({
        error: "Please complete personality assessment first",
      });
    }

    // Step 3: Get opposite gender filter
    const genderFilter = getOppositeGenderFilter(currentUser.gender);

    // =============================================================
    // DOMAIN VISIBILITY LOGIC
    // =============================================================
    const isGmail = currentUser.emailDomain === "gmail.com";
    const isPublic = currentUser.privacy === "public";
    const userDomain = currentUser.emailDomain;

    let domainMatchCondition = {};

    if (isGmail) {
      if (isPublic) {
        domainMatchCondition = {
          $or: [{ privacy: "public" }, { emailDomain: "gmail.com" }],
        };
      } else {
        domainMatchCondition = { emailDomain: "gmail.com" };
      }
    } else {
      if (isPublic) {
        domainMatchCondition = {
          $or: [{ emailDomain: userDomain }, { privacy: "public" }],
        };
      } else {
        domainMatchCondition = { emailDomain: userDomain };
      }
    }

    console.log("🎓 Final domainMatchCondition:", domainMatchCondition);

    // Step 4: Fetch opposite gender users from allowed domains
    let otherReports = await PersonalityReport.find({
      userId: { $ne: userId },
    })
      .populate({
        path: "userId",
        select: "_id gender emailDomain privacy deleted",
        model: "User",
        match: {
          deleted: false,
          ...genderFilter,
          ...domainMatchCondition,
        },
      })
      .lean();

    // Step 5: Remove nulls
    otherReports = otherReports.filter((r) => r.userId != null);

    if (otherReports.length === 0) {
      return res.json({
        success: true,
        matches: [],
        total: 0,
        message: "No matches found",
      });
    }

    // Step 6: Load profiles (optional)
    for (let vr of otherReports) {
      const p = await Profile.findOne({ user: vr.userId._id }).lean();
      vr.profile = p || {};
    }

    // Step 7: Normalize missing profile fields
    for (let vr of otherReports) {
      if (!vr.profile) vr.profile = {};
      vr.profile.name = vr.profile.name || "Unknown";
      vr.profile.age = vr.profile.age || null;
      vr.profile.gender = vr.profile.gender || "Other";
      vr.profile.bio = vr.profile.bio || "";
      vr.profile.profilePic = vr.profile.profilePic || null;
      vr.profile.interests = vr.profile.interests || [];
      vr.profile.branch = vr.profile.branch || "";
      vr.profile.course = vr.profile.course || "";
      vr.profile.year = vr.profile.year || null;
      vr.profile.location = vr.profile.location || "";
      vr.profile.preference = vr.profile.preference || "Any";
    }

    // Step 8: Score matches
    const scoredMatches = matcher.scoreAllMatches(
      myReport.bigFive,
      otherReports,
    );

    // Step 9: Format matches
    const topMatches = scoredMatches.slice(0, 50).map((match, idx) => {
      const p = match.profile || {};

      return {
        userId: match.userId._id.toString(),
        name: p.name || "Unknown",
        age: p.age || null,
        gender: p.gender || null,
        bio: p.bio || "",
        profilePic: p.profilePic || null,
        interests: p.interests || [],
        branch: p.branch || null,
        course: p.course || null,
        year: p.year || null,
        location: p.location || null,
        preference: p.preference || "Any",

        // required
        emailDomain: match.userId.emailDomain,
        privacy: match.userId.privacy,

        // FIX → always NONE (no ChatRequest system)
        chatStatus: "NONE",

        compatibility: Math.round(match.compatibility) || 0,
        category: matcher.categorizeMatch
          ? matcher.categorizeMatch(match.compatibility)
          : "Unknown",
        interpretation: match.interpretation || "Compatible match",

        strengths: (match.details?.strengthAreas || []).slice(0, 2),
        challenges: (match.details?.challengeAreas || []).slice(0, 2),

        isLocked: !premiumUser && idx >= 2,
      };
    });

    res.json({
      success: true,
      isPremium: premiumUser,
      matches: topMatches,
      total: topMatches.length,
    });
  } catch (err) {
    console.error("❌ Error in all-matches:", err);
    res.status(500).json({ error: "Failed to fetch matches: " + err.message });
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
