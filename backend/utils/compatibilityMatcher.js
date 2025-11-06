
class CompatibilityMatcher {
  /**
   * Main compatibility calculation
   * Your logic:
   * - Same positive traits = HIGH (complement each other)
   * - Opposite traits = MEDIUM (balance each other)
   * - Same negative traits = LOW (conflict)
   */

  calculateCompatibility(user1BigFive, user2BigFive) {
    // Define trait categories
    const traits = {
      openness: { positive: true },
      conscientiousness: { positive: true },
      extraversion: { positive: true },
      agreeableness: { positive: true },
      neuroticism: { positive: false } // Lower is better
    };

    let totalScore = 0;
    let maxScore = 0;
    const breakdown = {};

    // Calculate compatibility for each dimension
    Object.entries(traits).forEach(([dimension, info]) => {
      const score1 = user1BigFive[dimension];
      const score2 = user2BigFive[dimension];

      const compatScore = this.calculateDimensionCompatibility(
        score1,
        score2,
        dimension,
        info.positive
      );

      breakdown[dimension] = {
        score: compatScore,
        user1Score: score1,
        user2Score: score2
      };

      totalScore += compatScore;
      maxScore += 100;
    });

    // Average compatibility (0-100)
    const compatibility = Math.round(totalScore / Object.keys(traits).length);

    return {
      compatibility,
      breakdown,
      interpretation: this.getInterpretation(compatibility),
      details: this.getDetailedAnalysis(breakdown)
    };
  }

  calculateDimensionCompatibility(score1, score2, dimension, isPositive) {
    /**
     * Your logic:
     * - Same positive traits = 100% (both high)
     * - Opposite traits = 50% (one high, one low)
     * - Same negative traits = 0% (both low)
     */

    const diff = Math.abs(score1 - score2);
    const avg = (score1 + score2) / 2;

    let score = 0;

    if (isPositive) {
      // For positive traits (openness, conscientiousness, extraversion, agreeableness)

      if (score1 > 70 && score2 > 70) {
        // Both high = Excellent compatibility (100%)
        // They share positive traits
        score = 100 - (diff * 0.2); // Small penalty for slight differences
      } else if (score1 > 70 && score2 < 30 || (score1 < 30 && score2 > 70)) {
        // Opposite traits = Medium compatibility (50-60%)
        // They balance each other out
        score = 55 - (diff * 0.1);
      } else if (score1 < 30 && score2 < 30) {
        // Both low = Low compatibility (0-20%)
        // They share negative traits
        score = Math.max(0, 15 + (100 - diff) * 0.1);
      } else {
        // Mixed scores = Medium compatibility (40-70%)
        score = 50 + ((100 - diff) * 0.3);
      }
    } else {
      // For negative traits (neuroticism - lower is better)

      if (score1 < 30 && score2 < 30) {
        // Both low (emotionally stable) = Excellent (100%)
        score = 100 - (diff * 0.2);
      } else if ((score1 < 30 && score2 > 70) || (score1 > 70 && score2 < 30)) {
        // One stable, one anxious = Medium (50-60%)
        // One can support the other
        score = 55 - (diff * 0.1);
      } else if (score1 > 70 && score2 > 70) {
        // Both high neuroticism = Low (0-20%)
        // Both stressed and anxious
        score = Math.max(0, 15 + (100 - diff) * 0.1);
      } else {
        // Mixed = Medium (40-70%)
        score = 50 + ((100 - diff) * 0.3);
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  getInterpretation(compatibility) {
    if (compatibility >= 90) {
      return "Perfect match! You share core personality traits and values.";
    } else if (compatibility >= 80) {
      return "Excellent compatibility! Very promising connection.";
    } else if (compatibility >= 70) {
      return "Good compatibility. You'll understand each other well.";
    } else if (compatibility >= 60) {
      return "Decent compatibility. You can balance each other out nicely.";
    } else if (compatibility >= 50) {
      return "Moderate compatibility. Differences can be managed.";
    } else if (compatibility >= 40) {
      return "Some compatibility. You'd need to work on understanding.";
    } else if (compatibility >= 30) {
      return "Limited compatibility. Consider if challenges are worth it.";
    } else {
      return "Very low compatibility. Significant personality differences.";
    }
  }

  getDetailedAnalysis(breakdown) {
    const analysis = {
      strengthAreas: [],
      challengeAreas: [],
      complementaryTraits: [],
      potentialConflicts: []
    };

    Object.entries(breakdown).forEach(([dimension, data]) => {
      const { score, user1Score, user2Score } = data;
      const diff = Math.abs(user1Score - user2Score);

      // Identify strength areas
      if (score > 80) {
        analysis.strengthAreas.push({
          dimension,
          reason: this.getDimensionReason(dimension, user1Score, user2Score)
        });
      }

      // Identify challenge areas
      if (score < 50) {
        analysis.challengeAreas.push({
          dimension,
          reason: this.getDimensionChallenge(dimension, user1Score, user2Score)
        });
      }

      // Complementary traits (opposite but balanced)
      if (diff > 30 && score > 60) {
        analysis.complementaryTraits.push({
          dimension,
          user1: user1Score > user2Score ? 'higher' : 'lower',
          user2: user2Score > user1Score ? 'higher' : 'lower',
          benefit: this.getComplementaryBenefit(dimension)
        });
      }

      // Potential conflicts (similar negative traits)
      if (score < 40 && dimension !== 'openness') {
        analysis.potentialConflicts.push({
          dimension,
          issue: this.getConflictIssue(dimension, user1Score, user2Score)
        });
      }
    });

    return analysis;
  }

  getDimensionReason(dimension, score1, score2) {
    const dimensionDescriptions = {
      openness: 'Both love exploring new ideas and experiences',
      conscientiousness: 'Both are organized and reliable',
      extraversion: 'Both enjoy social interaction',
      agreeableness: 'Both are empathetic and cooperative',
      neuroticism: 'Both handle stress well'
    };
    return dimensionDescriptions[dimension] || 'Good match in this dimension';
  }

  getDimensionChallenge(dimension, score1, score2) {
    const challenges = {
      openness: 'Different approaches to new experiences',
      conscientiousness: 'Different organizational styles',
      extraversion: 'Different social needs',
      agreeableness: 'Different conflict approaches',
      neuroticism: 'Different stress responses'
    };
    return challenges[dimension] || 'Challenge in this dimension';
  }

  getComplementaryBenefit(dimension) {
    const benefits = {
      openness: 'One brings spontaneity, other brings stability',
      conscientiousness: 'One brings structure, other brings flexibility',
      extraversion: 'One brings social energy, other brings grounding',
      agreeableness: 'One brings empathy, other brings directness',
      neuroticism: 'One brings calm, other brings emotional awareness'
    };
    return benefits[dimension] || 'They can learn from each other';
  }

  getConflictIssue(dimension, score1, score2) {
    if (dimension === 'conscientiousness') {
      if (score1 < 30 && score2 < 30) return 'Both may struggle with planning and deadlines';
    }
    if (dimension === 'extraversion') {
      if (score1 < 30 && score2 < 30) return 'Both may be too withdrawn for a dynamic relationship';
    }
    if (dimension === 'agreeableness') {
      if (score1 < 30 && score2 < 30) return 'Both may struggle with compromise and empathy';
    }
    if (dimension === 'neuroticism') {
      if (score1 > 70 && score2 > 70) return 'Both may amplify each other\'s stress and anxiety';
    }
    return 'Potential conflict in this area';
  }

  // ===== ADVANCED MATCHING =====

  calculateWeightedCompatibility(user1, user2) {
    /**
     * Weighted compatibility:
     * - Some traits matter more in relationships
     * - Agreeableness and neuroticism are most important for romance
     * - Conscientiousness important for long-term compatibility
     * - Openness determines if they can grow together
     */

    const weights = {
      agreeableness: 0.3,    // Most important: teamwork, empathy
      neuroticism: 0.25,     // Important: emotional stability
      conscientiousness: 0.2, // Important: reliability
      openness: 0.15,         // Important: growth
      extraversion: 0.1       // Less critical
    };

    let weightedScore = 0;
    const breakdown = this.calculateCompatibility(user1.bigFive, user2.bigFive).breakdown;

    Object.entries(weights).forEach(([dimension, weight]) => {
      weightedScore += breakdown[dimension].score * weight;
    });

    return Math.round(weightedScore);
  }

  // ===== MATCH SCORING FOR MULTIPLE USERS =====

  scoreAllMatches(myBigFive, otherUsersList) {
    /**
     * Calculate compatibility with multiple users
     * Return sorted by compatibility score
     */

    const scored = otherUsersList.map(user => ({
      ...user,
      compatibility: this.calculateWeightedCompatibility(
        { bigFive: myBigFive },
        { bigFive: user.bigFive }
      ),
      ...this.calculateCompatibility(myBigFive, user.bigFive)
    }));

    // Sort by compatibility (highest first)
    return scored.sort((a, b) => b.compatibility - a.compatibility);
  }

  // ===== COMPATIBILITY CATEGORIES =====

  categorizeMatch(compatibility) {
    if (compatibility >= 85) return 'Perfect Match';
    if (compatibility >= 75) return 'Excellent';
    if (compatibility >= 65) return 'Very Good';
    if (compatibility >= 55) return 'Good';
    if (compatibility >= 45) return 'Fair';
    if (compatibility >= 30) return 'Possible';
    return 'Low';
  }
}

const matcher = new CompatibilityMatcher();

module.exports = {
  calculateCompatibility: matcher.calculateCompatibility.bind(matcher),
  calculateWeightedCompatibility: matcher.calculateWeightedCompatibility.bind(matcher),
  scoreAllMatches: matcher.scoreAllMatches.bind(matcher),
  categorizeMatch: matcher.categorizeMatch.bind(matcher),
};
