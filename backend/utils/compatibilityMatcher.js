// ============================================================================
// UPDATED COMPATIBILITY MATCHER - FOR 26-QUESTION RESTRUCTURED SYSTEM
// Pure JavaScript - Works with reorganized questions (TEXT → BUBBLE → DEALBREAKER)
// FIXED: scoreAllMatches now handles proper parameter structure
// ============================================================================

class CompatibilityMatcher {
  /**
   * CRITICAL: Check dealbreakers FIRST before any personality matching
   * If ANY dealbreaker mismatch exists, compatibility = 0%
   * Updated for new question IDs
   */
  checkDealbreakers(user1Dealbreakers = {}, user2Dealbreakers = {}, user1Answers = {}, user2Answers = {}) {
    const dealbreakers = {
      db_1: { name: 'kids', question: 'Having/not having children' },
      db_2: { name: 'monogamy', question: 'Monogamy vs open relationship' },
      db_3: { name: 'religion', question: 'Religion/spirituality alignment' },
      db_4: { name: 'values', question: 'Political and social values' },
      db_5: { name: 'lifestyle', question: 'Lifestyle preferences (smoking, drinking, diet)' }
    };

    const issues = [];
    let hasCriticalMismatch = false;

    Object.entries(dealbreakers).forEach(([dbId, info]) => {
      const user1MarkedDealbreaker = user1Dealbreakers[info.name] === true;
      const user2MarkedDealbreaker = user2Dealbreakers[info.name] === true;

      if (user1MarkedDealbreaker || user2MarkedDealbreaker) {
        issues.push({
          dealbreaker: info.name,
          question: info.question,
          severity: 'critical',
          user1Marked: user1MarkedDealbreaker,
          user2Marked: user2MarkedDealbreaker
        });
        hasCriticalMismatch = true;
      }
    });

    return {
      compatible: !hasCriticalMismatch,
      issues: issues,
      criticalMismatch: hasCriticalMismatch
    };
  }

  /**
   * Enhanced compatibility calculation with weighted scoring
   * Updated for new question structure
   */
  calculateCompatibility(
    user1BigFive = {},
    user2BigFive = {},
    user1Attachment = {},
    user2Attachment = {},
    user1Answers = {},
    user2Answers = {}
  ) {
    // Personality trait weights (total: 50%)
    const traits = {
      openness: { positive: true, weight: 0.08 },
      conscientiousness: { positive: true, weight: 0.10 },
      extraversion: { positive: true, weight: 0.08 },
      agreeableness: { positive: true, weight: 0.14 }, // CRITICAL for relationships
      neuroticism: { positive: false, weight: 0.10 }
    };

    let totalScore = 0;
    const breakdown = {};

    // === PERSONALITY TRAIT COMPATIBILITY (50% weight) ===
    Object.entries(traits).forEach(([dimension, info]) => {
      const score1 = user1BigFive[dimension] || 50;
      const score2 = user2BigFive[dimension] || 50;

      const compatScore = this.calculateDimensionCompatibility(
        score1,
        score2,
        dimension,
        info.positive
      );

      breakdown[dimension] = {
        score: compatScore,
        user1Score: score1,
        user2Score: score2,
        weight: info.weight
      };

      totalScore += compatScore * info.weight;
    });

    // === ATTACHMENT STYLE COMPATIBILITY (25% weight) ===
    const attachmentCompatibility = this.calculateAttachmentCompatibility(
      user1Attachment,
      user2Attachment
    );

    breakdown.attachment = {
      score: attachmentCompatibility.score,
      user1: user1Attachment?.attachment || 'Unknown',
      user2: user2Attachment?.attachment || 'Unknown',
      weight: 0.25
    };

    totalScore += attachmentCompatibility.score * 0.25;

    // === LOVE LANGUAGE COMPATIBILITY (10% weight) ===
    const loveLanguageCompat = this.calculateLoveLanguageCompatibility(
      user1Answers[5], // Q5: Love language
      user2Answers[5]
    );

    breakdown.loveLanguage = {
      score: loveLanguageCompat.score,
      user1Language: loveLanguageCompat.user1Language,
      user2Language: loveLanguageCompat.user2Language,
      weight: 0.10
    };

    totalScore += loveLanguageCompat.score * 0.10;

    // === CONFLICT RESOLUTION STYLE COMPATIBILITY (10% weight) ===
    const conflictCompat = this.calculateConflictStyleCompatibility(
      user1Answers[4], // Q4: Conflict handling
      user2Answers[4]
    );

    breakdown.conflictStyle = {
      score: conflictCompat.score,
      user1Style: conflictCompat.user1Style,
      user2Style: conflictCompat.user2Style,
      weight: 0.10
    };

    totalScore += conflictCompat.score * 0.10;

    // === VALUES COMPATIBILITY (5% weight) ===
    const valuesCompat = this.calculateValuesCompatibility(
      user1Answers[17], // Q17: Financial stability
      user2Answers[17]
    );

    breakdown.values = {
      score: valuesCompat.score,
      weight: 0.05
    };

    totalScore += valuesCompat.score * 0.05;

    const compatibility = Math.round(totalScore);

    return {
      compatibility: Math.max(0, Math.min(100, compatibility)),
      breakdown,
      interpretation: this.getInterpretation(compatibility),
      attachmentMatch: attachmentCompatibility.match,
      loveLanguageMatch: loveLanguageCompat.match,
      conflictStyleMatch: conflictCompat.match,
      details: this.getDetailedAnalysis(breakdown)
    };
  }

  /**
   * Love Language Compatibility Scoring
   * Q5 answers: 1=Words, 2=Acts, 3=Gifts, 4=Quality, 5=Physical
   */
  calculateLoveLanguageCompatibility(user1Answer, user2Answer) {
    const loveLanguages = {
      1: 'Words of Affirmation',
      2: 'Acts of Service',
      3: 'Receiving Gifts',
      4: 'Quality Time',
      5: 'Physical Touch'
    };

    const user1Language = loveLanguages[user1Answer] || 'Unknown';
    const user2Language = loveLanguages[user2Answer] || 'Unknown';

    let score = 0;
    let match = '';

    if (user1Answer === user2Answer) {
      score = 100;
      match = `Perfect match! Both share ${user1Language} as their primary love language.`;
    } else {
      const compatibilityMatrix = {
        '1-2': 75, '1-3': 65, '1-4': 85, '1-5': 70,
        '2-3': 80, '2-4': 90, '2-5': 75,
        '3-4': 70, '3-5': 65,
        '4-5': 95
      };

      const pair = [user1Answer, user2Answer].sort().join('-');
      score = compatibilityMatrix[pair] || 60;
      match = `Different love languages (${user1Language} & ${user2Language}) - understanding needed.`;
    }

    return { score, match, user1Language, user2Language };
  }

  /**
   * Conflict Resolution Style Compatibility
   * Q4 answers: 1=Direct, 2=Cool down, 3=Avoid, 4=Emotional
   */
  calculateConflictStyleCompatibility(user1Answer, user2Answer) {
    const conflictStyles = {
      1: 'Direct Communicator',
      2: 'Reflective Processor',
      3: 'Conflict Avoider',
      4: 'Emotional Processor'
    };

    const user1Style = conflictStyles[user1Answer] || 'Unknown';
    const user2Style = conflictStyles[user2Answer] || 'Unknown';

    let score = 0;
    let match = '';

    if (user1Answer === user2Answer) {
      score = user1Answer === 3 ? 60 : 95;
      match = user1Answer === 3
        ? 'Both avoid conflict - may lead to unresolved issues'
        : `Both share ${user1Style} style - excellent alignment`;
    } else {
      const compatibilityMatrix = {
        '1-2': 85, '1-3': 40, '1-4': 70,
        '2-3': 50, '2-4': 75,
        '3-4': 45
      };

      const pair = [user1Answer, user2Answer].sort().join('-');
      score = compatibilityMatrix[pair] || 60;

      if ((user1Answer === 1 && user2Answer === 3) || (user1Answer === 3 && user2Answer === 1)) {
        match = 'Direct vs Avoidant - significant communication work needed';
      } else {
        match = `Different styles (${user1Style} & ${user2Style}) - complementary with effort`;
      }
    }

    return { score, match, user1Style, user2Style };
  }

  /**
   * Values Compatibility (Financial preferences)
   * Q17 answers: 1=Very important, 2=Important, 3=Flexible, 4=Not important
   */
  calculateValuesCompatibility(user1FinancialAnswer, user2FinancialAnswer) {
    // Handle undefined/null answers
    const ans1 = user1FinancialAnswer || 3;
    const ans2 = user2FinancialAnswer || 3;

    const diff = Math.abs(ans1 - ans2);

    let score = 0;
    if (diff === 0) {
      score = 100;
    } else if (diff === 1) {
      score = 80;
    } else if (diff === 2) {
      score = 60;
    } else {
      score = 40;
    }

    return { score };
  }

  /**
   * Attachment Style Compatibility
   */
  calculateAttachmentCompatibility(user1Attachment = {}, user2Attachment = {}) {
    const attachment1 = user1Attachment?.attachment || 'Secure';
    const attachment2 = user2Attachment?.attachment || 'Secure';

    let compatibilityScore = 0;
    let match = '';

    if (attachment1 === 'Secure' && attachment2 === 'Secure') {
      compatibilityScore = 100;
      match = 'Secure-Secure: Ideal pairing. Both comfortable with intimacy and independence.';
    } else if (attachment1 === 'Secure' || attachment2 === 'Secure') {
      compatibilityScore = 80;
      match = 'Secure + Insecure: The secure partner provides stability and healing potential.';
    } else if (
      (attachment1 === 'Anxious-Preoccupied' && attachment2 === 'Dismissive-Avoidant') ||
      (attachment1 === 'Dismissive-Avoidant' && attachment2 === 'Anxious-Preoccupied')
    ) {
      compatibilityScore = 25;
      match = 'Anxious-Avoidant Trap: Classic pursue-withdraw pattern. High conflict potential.';
    } else if (attachment1 === 'Anxious-Preoccupied' && attachment2 === 'Anxious-Preoccupied') {
      compatibilityScore = 55;
      match = 'Anxious-Anxious: Mutual support but risk of codependency.';
    } else if (attachment1 === 'Dismissive-Avoidant' && attachment2 === 'Dismissive-Avoidant') {
      compatibilityScore = 45;
      match = 'Avoidant-Avoidant: May lack emotional intimacy despite respecting independence.';
    } else {
      compatibilityScore = 50;
      match = 'Mixed Attachment: Requires patience and emotional work.';
    }

    return { score: compatibilityScore, match: match };
  }

  /**
   * Big Five Dimension Compatibility
   */
  calculateDimensionCompatibility(score1, score2, dimension, isPositive) {
    const diff = Math.abs(score1 - score2);

    let score = 0;

    if (isPositive) {
      if (score1 > 70 && score2 > 70) {
        score = 100 - (diff * 0.2);
      } else if ((score1 > 70 && score2 < 30) || (score1 < 30 && score2 > 70)) {
        score = 55 - (diff * 0.1);
      } else if (score1 < 30 && score2 < 30) {
        score = Math.max(0, 15 + (100 - diff) * 0.1);
      } else {
        score = 50 + ((100 - diff) * 0.3);
      }
    } else {
      if (score1 < 30 && score2 < 30) {
        score = 100 - (diff * 0.2);
      } else if ((score1 < 30 && score2 > 70) || (score1 > 70 && score2 < 30)) {
        score = 55 - (diff * 0.1);
      } else if (score1 > 70 && score2 > 70) {
        score = Math.max(0, 15 + (100 - diff) * 0.1);
      } else {
        score = 50 + ((100 - diff) * 0.3);
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Compatibility Interpretation
   */
  getInterpretation(compatibility) {
    if (compatibility >= 90) {
      return "Exceptional match! You share core values and aligned attachment styles.";
    } else if (compatibility >= 80) {
      return "Excellent compatibility! Very promising connection with strong alignment.";
    } else if (compatibility >= 70) {
      return "Good compatibility. You understand each other well.";
    } else if (compatibility >= 60) {
      return "Decent compatibility. You can balance each other with conscious effort.";
    } else if (compatibility >= 50) {
      return "Moderate compatibility. Success requires understanding attachment needs.";
    } else if (compatibility >= 40) {
      return "Some compatibility. Significant work needed on communication.";
    } else if (compatibility >= 30) {
      return "Limited compatibility. Consider whether challenges align with your goals.";
    } else {
      return "Very low compatibility. Significant personality and value differences exist.";
    }
  }

  /**
   * Detailed Analysis Generation
   */
  getDetailedAnalysis(breakdown) {
    const analysis = {
      strengthAreas: [],
      challengeAreas: [],
      complementaryTraits: [],
      potentialConflicts: []
    };

    Object.entries(breakdown).forEach(([dimension, data]) => {
      if (data.score > 80) {
        analysis.strengthAreas.push(dimension);
      }
      if (data.score < 50) {
        analysis.challengeAreas.push(dimension);
      }
    });

    return analysis;
  }

  /**
   * Score all potential matches and sort by compatibility
   * CRITICAL: Filters out dealbreaker mismatches (sets compatibility = 0)
   * 
   * FIXED: Now accepts either:
   * - Old format: scoreAllMatches(myBigFive, validReports)
   * - New format: scoreAllMatches(myBigFive, myAttachment, myDealbreakers, myAnswers, otherUsersList)
   */
  scoreAllMatches(param1, param2, param3, param4, param5) {
    // Detect which format is being used
    let myBigFive, otherUsersList;

    // OLD FORMAT: scoreAllMatches(myBigFive, validReports)
    if (!param3 && Array.isArray(param2)) {
      myBigFive = param1;
      otherUsersList = param2;
      
      // Use old simple scoring without dealbreakers
      return this.scoreAllMatchesSimple(myBigFive, otherUsersList);
    }

    // NEW FORMAT: scoreAllMatches(myBigFive, myAttachment, myDealbreakers, myAnswers, otherUsersList)
    if (Array.isArray(param5)) {
      myBigFive = param1;
      const myAttachment = param2;
      const myDealbreakers = param3;
      const myAnswers = param4;
      otherUsersList = param5;

      return this.scoreAllMatchesAdvanced(
        myBigFive,
        myAttachment,
        myDealbreakers,
        myAnswers,
        otherUsersList
      );
    }

    // If we can't determine the format, log error and return empty array
    console.error('❌ scoreAllMatches: Invalid parameter format');
    console.error('   Expected either: scoreAllMatches(bigFive, reports)');
    console.error('   Or: scoreAllMatches(bigFive, attachment, dealbreakers, answers, reports)');
    return [];
  }

  /**
   * Simple scoring (OLD FORMAT)
   * Used when only Big Five and reports are passed
   */
  scoreAllMatchesSimple(myBigFive, otherUsersList) {
    if (!Array.isArray(otherUsersList)) {
      console.warn('⚠️ otherUsersList is not an array:', typeof otherUsersList);
      return [];
    }

    const scored = otherUsersList.map(user => {
      // Calculate compatibility with basic scoring
      const compatResult = this.calculateCompatibility(
        myBigFive,
        user.bigFive || {},
        {},
        {}
      );

      return {
        ...user,
        userId: user.userId || user._id,
        compatibility: compatResult.compatibility,
        ...compatResult,
        blocked: false
      };
    });

    // Sort by compatibility (highest first)
    return scored.sort((a, b) => b.compatibility - a.compatibility);
  }

  /**
   * Advanced scoring (NEW FORMAT)
   * Used when dealbreakers, attachment styles, and answers are included
   */
  scoreAllMatchesAdvanced(myBigFive, myAttachment, myDealbreakers, myAnswers, otherUsersList) {
    if (!Array.isArray(otherUsersList)) {
      console.warn('⚠️ otherUsersList is not an array:', typeof otherUsersList);
      return [];
    }

    const scored = otherUsersList.map(user => {
      // Check dealbreakers FIRST
      const dealbreakersCheck = this.checkDealbreakers(
        myDealbreakers,
        user.dealbreakers || {},
        myAnswers,
        user.answers || {}
      );

      // If critical dealbreaker mismatch, set compatibility to 0
      if (dealbreakersCheck.criticalMismatch) {
        return {
          ...user,
          userId: user.userId || user._id,
          compatibility: 0,
          dealbreakerIssues: dealbreakersCheck.issues,
          status: 'Incompatible - Dealbreaker Mismatch',
          blocked: true
        };
      }

      // If dealbreakers pass, calculate full compatibility
      const compatResult = this.calculateCompatibility(
        myBigFive,
        user.bigFive || {},
        myAttachment,
        user.attachment || {},
        myAnswers,
        user.answers || {}
      );

      return {
        ...user,
        userId: user.userId || user._id,
        compatibility: compatResult.compatibility,
        ...compatResult,
        dealbreakerIssues: dealbreakersCheck.issues,
        blocked: false
      };
    });

    // Sort by compatibility (highest first), blocked users go to end
    return scored.sort((a, b) => {
      if (a.blocked && !b.blocked) return 1;
      if (!a.blocked && b.blocked) return -1;
      return b.compatibility - a.compatibility;
    });
  }

  /**
   * Categorize compatibility score
   */
  categorizeMatch(compatibility) {
    if (compatibility === 0) return 'Incompatible';
    if (compatibility >= 90) return 'Perfect Match';
    if (compatibility >= 80) return 'Excellent';
    if (compatibility >= 70) return 'Very Good';
    if (compatibility >= 60) return 'Good';
    if (compatibility >= 50) return 'Fair';
    if (compatibility >= 40) return 'Possible';
    return 'Low';
  }
}

module.exports = new CompatibilityMatcher();