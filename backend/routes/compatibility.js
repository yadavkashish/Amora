const express = require('express');
const router = express.Router();
const {protect} = require('../middleware/auth');
const matcher = require('../utils/compatibilityMatcher');
const PersonalityReport = require('../models/PersonalityReport');
const CompatibilityCache = require('../models/CompatibilityCache');
const User = require('../models/User');
const Profile = require('../models/Profile');


// POST: Submit compatibility answers
router.post('/submit', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { answers, dealbreakers, timeSpent, totalTimeSpent, completedAt } = req.body;

    // Validate input
    if (!answers || Object.keys(answers).length === 0) {
      return res.status(400).json({ error: 'No answers provided' });
    }

    // Calculate Big Five scores from answers
    const bigFiveScores = calculateBigFiveScores(answers);

    // Save or update PersonalityReport
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
      message: 'Answers saved successfully',
      bigFive: bigFiveScores,
      reportId: report.id,
    });
  } catch (err) {
    console.error('❌ Error saving compatibility answers:', err);
    res.status(500).json({ error: err.message });
  }
});

// Helper function to calculate Big Five from answers
function calculateBigFiveScores(answers) {
  // Map question IDs to Big Five dimensions
  // This depends on your question structure - adjust based on your data
  const bigFive = {
    openness: 0,
    conscientiousness: 0,
    extraversion: 0,
    agreeableness: 0,
    neuroticism: 0,
  };

  // Example mapping (adjust based on your actual question IDs)
  const dimensionMap = {
    // Questions 1-5: Openness
    1: 'openness', 2: 'openness', 3: 'openness', 4: 'openness', 5: 'openness',
    // Questions 6-10: Conscientiousness
    6: 'conscientiousness', 7: 'conscientiousness', 8: 'conscientiousness', 9: 'conscientiousness', 10: 'conscientiousness',
    // Questions 11-15: Extraversion
    11: 'extraversion', 12: 'extraversion', 13: 'extraversion', 14: 'extraversion', 15: 'extraversion',
    // Questions 16-20: Agreeableness
    16: 'agreeableness', 17: 'agreeableness', 18: 'agreeableness', 19: 'agreeableness', 20: 'agreeableness',
    // Questions 21-25: Neuroticism
    21: 'neuroticism', 22: 'neuroticism', 23: 'neuroticism', 24: 'neuroticism', 25: 'neuroticism',
  };

  // Calculate averages for each dimension
  const counts = {
    openness: 0, conscientiousness: 0, extraversion: 0,
    agreeableness: 0, neuroticism: 0,
  };

  Object.entries(answers).forEach(([questionId, score]) => {
    const dimension = dimensionMap[parseInt(questionId)];
    if (dimension) {
      bigFive[dimension] += score;
      counts[dimension]++;
    }
  });

  // Convert to 0-100 scale
  Object.keys(bigFive).forEach(dimension => {
    if (counts[dimension] > 0) {
      bigFive[dimension] = Math.round((bigFive[dimension] / counts[dimension]) * 20); // Assuming 5-point scale
    }
  });

  return bigFive;
}


// GET: Calculate compatibility between two users
router.get('/match/:user1Id/:user2Id', protect, async (req, res) => {
  try {
    const { user1Id, user2Id } = req.params;

    // Check cache first
    let cached = await CompatibilityCache.findOne({
      $or: [
        { user1Id, user2Id },
        { user1Id: user2Id, user2Id: user1Id }
      ]
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
          potentialConflicts: cached.potentialConflicts
        }
      });
    }

    // Get both users' personality reports
    const report1 = await PersonalityReport.findOne({ userId: user1Id });
    const report2 = await PersonalityReport.findOne({ userId: user2Id });

    if (!report1 || !report2) {
      return res.status(404).json({ error: 'One or both users have not completed personality assessment' });
    }

    // Calculate compatibility
    const result = matcher.calculateCompatibility(report1.bigFive, report2.bigFive);
    const weighted = matcher.calculateWeightedCompatibility(report1, report2);
    const category = matcher.categorizeMatch(weighted);

    // Cache result
    const compatibility = new CompatibilityCache({
      user1Id,
      user2Id,
      compatibility: weighted,
      weightedCompatibility: weighted,
      breakdown: result.breakdown,
      strengthAreas: result.details.strengthAreas.map(s => s.dimension || s),
      challengeAreas: result.details.challengeAreas.map(c => c.dimension || c),
      complementaryTraits: result.details.complementaryTraits,
      potentialConflicts: result.details.potentialConflicts.map(p => p.issue || p),
      interpretation: result.interpretation,
      category
    });

    await compatibility.save();

    res.json({
      compatibility: weighted,
      interpretation: result.interpretation,
      category,
      details: result.details
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Get all matches for current user (sorted by compatibility)
// GET: Get all matches for current user (sorted by compatibility)
router.get('/all-matches', protect, async (req, res) => {
  try {
    console.log('🔍 Fetching all matches for user:', req.user._id);
    
    const userId = req.user._id;

    // Step 1: Get current user's personality report
    const myReport = await PersonalityReport.findOne({ userId });
    if (!myReport) {
      console.warn('⚠️ No report found for user:', userId);
      return res.status(404).json({ error: 'Please complete personality assessment first' });
    }
    console.log('✅ Current user report found');

    // Step 2: Get all other users' personality reports with user IDs populated
    let otherReports = await PersonalityReport.find({ userId: { $ne: userId } })
      .populate({
        path: 'userId',
        select: '_id', // only need id here for mapping
        model: 'User',
      })
      .lean();

    console.log('✅ Found', otherReports.length, 'other reports');

    // Defensive filtering: keep only reports where userId is populated (not null)
    otherReports = otherReports.filter(report => report.userId != null);

    // Step 3: Get profiles for valid user IDs
    const userIds = otherReports.map(report => report.userId._id);
    const profiles = await Profile.find({ user: { $in: userIds } })
      .select('user name age gender bio profilePic interests branch course year location preference')
      .lean();

    console.log('✅ Found', profiles.length, 'profiles');

    // Step 4: Map profiles by userId for quick lookup
    const profileMap = new Map();
    profiles.forEach(profile => {
      if (profile.user) {
        profileMap.set(profile.user.toString(), profile);
      }
    });

    // Step 5: Merge profiles into reports and filter valid
    const validReports = otherReports
      .map(report => ({
        ...report,
        profile: profileMap.get(report.userId._id.toString()) || null,
      }))
      .filter(report => {
        if (!report.profile) {
          console.warn('⚠️ Report missing profile for userId:', report.userId._id);
          return false;
        }
        if (!report.bigFive) {
          console.warn('⚠️ Report missing bigFive for userId:', report.userId._id);
          return false;
        }
        if (!report.profile.name) {
          console.warn('⚠️ Profile missing name for userId:', report.userId._id);
          return false;
        }
        return true;
      });

    console.log(`✅ Valid reports after filtering: ${validReports.length}`);

    if (validReports.length === 0) {
      console.warn('⚠️ No valid other users found');
      return res.json({ matches: [], total: 0, message: 'No other users available' });
    }

    // Step 6: Score matches
    const scoredMatches = matcher.scoreAllMatches(myReport.bigFive, validReports);
    console.log(`✅ Scored ${scoredMatches.length} matches`);

    // Step 7: Format matches with profiles
    const topMatches = scoredMatches
      .slice(0, 50)
      .map((match, idx) => {
        try {
          const { profile } = match;
          const userId = match.userId._id || match.userId;

          return {
            userId: userId.toString(),
            name: profile.name || 'Unknown User',
            age: profile.age || null,
            gender: profile.gender || null,
            bio: profile.bio || '',
            profilePic: profile.profilePic || null,
            interests: profile.interests || [],
            branch: profile.branch || null,
            course: profile.course || null,
            year: profile.year || null,
            location: profile.location || null,
            preference: profile.preference || 'Any',
            compatibility: Math.round(match.compatibility) || 0,
            category: matcher.categorizeMatch ? matcher.categorizeMatch(match.compatibility) : 'Unknown',
            interpretation: match.interpretation || 'Compatible match',
            strengths: (match.details?.strengthAreas || []).slice(0, 2),
            challenges: (match.details?.challengeAreas || []).slice(0, 2)
          };
        } catch (e) {
          console.error(`❌ Error formatting match #${idx}`, e);
          return null;
        }
      })
      .filter(m => m !== null);

    console.log(`✅ Successfully formatted ${topMatches.length} matches for response`);

    res.json({
      success: true,
      matches: topMatches,
      total: topMatches.length,
      message: `Found ${topMatches.length} compatible matches`
    });

  } catch (err) {
    console.error('❌ Error in all-matches:', err);
    res.status(500).json({ error: 'Failed to fetch matches: ' + err.message });
  }
});


// GET: Get matches filtered by compatibility range
router.get('/matches-by-range', protect, async (req, res) => {
  try {
    const { minCompat = 50, maxCompat = 100 } = req.query;
    const userId = req.user._id;

    const myReport = await PersonalityReport.findOne({ userId });

    if (!myReport) {
      return res.status(404).json({ error: 'Please complete personality assessment first' });
    }

    const otherReports = await PersonalityReport.find({ userId: { $ne: userId } })
      .populate('userId', 'name age gender bio profilePic');

    const scoredMatches = matcher.scoreAllMatches(myReport.bigFive, otherReports);

    const filtered = scoredMatches.filter(
      m => m.compatibility >= minCompat && m.compatibility <= maxCompat
    );

    const results = filtered.map(match => ({
      userId: match.userId.id,
      name: match.userId.name,
      age: match.userId.age,
      compatibility: match.compatibility,
      category: matcher.categorizeMatch(match.compatibility),
      interpretation: match.interpretation
    }));

    res.json({ matches: results, count: results.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/debug/all-matches-debug', protect, async (req, res) => {
  try {
    console.log('🔍 DEBUG: Starting all-matches debug');
    const userId = req.user._id;
    console.log('✅ Got userId:', userId);

    // Get current user's personality report
    const myReport = await PersonalityReport.findOne({ userId });
    console.log('✅ Got myReport:', !!myReport);
    console.log('   - Has bigFive:', !!myReport?.bigFive);
    console.log('   - BigFive scores:', myReport?.bigFive);

    if (!myReport) {
      return res.status(404).json({ error: 'No report found' });
    }

    // Get all other users' reports WITHOUT populate first
    console.log('🔍 Fetching all other reports...');
    const otherReports = await PersonalityReport.find({ userId: { $ne: userId } });
    console.log('✅ Found', otherReports.length, 'other reports');

    // Check structure of first report
    if (otherReports.length > 0) {
      console.log('📋 First report structure:', {
        hasUserId: !!otherReports[0].userId,
        userIdType: typeof otherReports[0].userId,
        userId: otherReports[0].userId,
        hasBigFive: !!otherReports[0].bigFive,
        bigFiveKeys: otherReports[0].bigFive ? Object.keys(otherReports[0].bigFive) : 'N/A'
      });
    }

    // Now try to populate
    console.log('🔍 Attempting to populate userId...');
    const populatedReports = await PersonalityReport.find({ userId: { $ne: userId } })
      .populate('userId', 'name age gender bio profilePic');

    console.log('✅ Population successful');
    
    if (populatedReports.length > 0) {
      console.log('📋 First populated report:', {
        userId: populatedReports[0].userId,
        userIdIsNull: populatedReports[0].userId === null,
        userIdIsUndefined: populatedReports[0].userId === undefined
      });
    }

    // Check if matcher exists
    console.log('🔍 Checking matcher...');
    console.log('✅ Matcher functions:', {
      hasScoreAllMatches: typeof matcher.scoreAllMatches,
      hasCategorizeMatch: typeof matcher.categorizeMatch
    });

    res.json({
      success: true,
      debug: {
        userFound: !!myReport,
        otherReportsCount: otherReports.length,
        populatedReportsCount: populatedReports.length,
        firstReportUserId: populatedReports[0]?.userId,
        myReportBigFive: myReport.bigFive
      }
    });

  } catch (err) {
    console.error('❌ Debug error:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    res.status(500).json({ 
      error: err.message,
      type: err.name,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// GET: Get compatibility details between two users
router.get('/details/:otherUserId', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.params;

    const myReport = await PersonalityReport.findOne({ userId });
    const otherReport = await PersonalityReport.findOne({ userId: otherUserId });

    if (!myReport || !otherReport) {
      return res.status(404).json({ error: 'One or both users have not completed assessment' });
    }

    const result = matcher.calculateCompatibility(myReport.bigFive, otherReport.bigFive);

    res.json({
      myProfile: {
        type: myReport.personalityProfile,
        scores: myReport.bigFive
      },
      otherProfile: {
        type: otherReport.personalityProfile,
        scores: otherReport.bigFive
      },
      compatibility: result.compatibility,
      interpretation: result.interpretation,
      breakdown: result.breakdown,
      analysis: result.details
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;