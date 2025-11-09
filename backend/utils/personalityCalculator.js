// ============================================================================
// UPDATED PERSONALITY CALCULATOR - FOR 26-QUESTION RESTRUCTURED SYSTEM
// Pure JavaScript - Works with reorganized questions (TEXT → BUBBLE → DEALBREAKER)
// ============================================================================

class PersonalityCalculator {
  // ==================== BIG FIVE CALCULATION ====================
  /**
   * Updated mapping for 26 REORGANIZED questions
   * IDs match the restructured question array
   */
  calculateBigFive(answers) {
    const scores = {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0
    };

    const questionMappings = {
      // Openness: Risk-taking (Q12) + Weekend preferences (Q18)
      openness: {
        questions: [12, 18],
        weights: [1, 0.7],
        type: 'mixed'
      },

      // Conscientiousness: Planning (Q16) + Logic-based decisions (Q14)
      conscientiousness: {
        questions: [16, 14],
        weights: [1, 0.9],
        type: 'direct'
      },

      // Extraversion: Center of attention (Q10) + Social situations (Q11)
      extraversion: {
        questions: [10, 11],
        weights: [1, 0.8],
        type: 'direct'
      },

      // Agreeableness: Empathy (Q13) + Compromising beliefs (Q20) + Conflict handling (Q4)
      agreeableness: {
        questions: [13, 20, 4],
        weights: [1, -0.8, 0.6], // Q20 is reversed (negative weight)
        type: 'mixed'
      },

      // Neuroticism: Stress response (Q15) + Reassurance need (Q6) + Anxiety from no contact (Q19)
      neuroticism: {
        questions: [15, 6, 19],
        weights: [1, 0.7, 0.8],
        type: 'direct'
      }
    };

    // Calculate each dimension
    Object.keys(questionMappings).forEach(dimension => {
      const mapping = questionMappings[dimension];
      let totalWeightedScore = 0;
      let totalWeight = 0;

      mapping.questions.forEach((questionId, index) => {
        const answer = answers[questionId];
        if (answer !== undefined) {
          // Normalize answer to 0-100 scale
          let normalizedScore = this.normalizeAnswer(answer, questionId);
          
          // Apply weight (can be negative for reversed scoring)
          const weight = mapping.weights[index];
          if (weight < 0) {
            normalizedScore = 100 - normalizedScore;
          }
          
          totalWeightedScore += normalizedScore * Math.abs(weight);
          totalWeight += Math.abs(weight);
        }
      });

      // Calculate final score (0-100)
      if (totalWeight > 0) {
        scores[dimension] = Math.round(totalWeightedScore / totalWeight);
        scores[dimension] = Math.max(0, Math.min(100, scores[dimension]));
      }
    });

    return scores;
  }

  /**
   * Normalize different question types to 0-100 scale
   * Updated for new question structure
   */
  normalizeAnswer(answer, questionId) {
    // BUBBLE questions (5-point Likert scale)
    const bubbleQuestions = [6, 7, 10, 12, 13, 14, 16, 19, 20, 21, 22, 23];
    if (bubbleQuestions.includes(questionId)) {
      // answer: 1 (Strongly Agree) → 100, 5 (Strongly Disagree) → 0
      return ((6 - answer) / 5) * 100;
    }

    // QUICK_POLL questions (3-point scale)
    const quickPollQuestions = [11, 15];
    if (quickPollQuestions.includes(questionId)) {
      // answer: 1 → 100, 2 → 50, 3 → 0
      return ((4 - answer) / 3) * 100;
    }

    // EMOJI_SCALE question (4-point scale) - Q2
    if (questionId === 2) {
      // answer: 1-4 → normalize to 0-100
      return ((answer - 1) / 3) * 100;
    }

    // TEXT questions - map specific answers to scores
    return this.normalizeTextAnswer(answer, questionId);
  }

  /**
   * Map TEXT question answers to normalized scores
   * Updated for restructured questions (Q1, Q3, Q4, Q5, Q8, Q9, Q17, Q18, Q24)
   */
  normalizeTextAnswer(answer, questionId) {
    const textMappings = {
      // Q1: Relationship status (context only, not scored)
      1: { 1: 50, 2: 50, 3: 50, 4: 50 },

      // Q3: Love expression (compatibility, maps to personality)
      3: { 1: 75, 2: 85, 3: 90, 4: 80 },
      
      // Q4: Conflict handling (maps to agreeableness + neuroticism)
      4: { 1: 90, 2: 70, 3: 30, 4: 50 },
      
      // Q5: Love language (compatibility matching, not scored)
      5: { 1: 50, 2: 50, 3: 50, 4: 50, 5: 50 },
      
      // Q8: Partner upset response (empathy)
      8: { 1: 100, 2: 60, 3: 70, 4: 30 },
      
      // Q9: Emotional vulnerability (attachment)
      9: { 1: 100, 2: 80, 3: 50, 4: 20 },
      
      // Q17: Financial stability (values)
      17: { 1: 90, 2: 70, 3: 50, 4: 30 },
      
      // Q18: Weekend preferences (openness/extraversion)
      18: { 1: 90, 2: 40, 3: 85, 4: 75 },
      
      // Q24: Shared expenses (values)
      24: { 1: 80, 2: 85, 3: 50, 4: 60 }
    };

    return textMappings[questionId]?.[answer] || 50;
  }

  // ==================== ATTACHMENT STYLE CALCULATION ====================
  /**
   * Enhanced attachment calculation using 8 attachment-specific questions
   * Updated for new question IDs
   */
  calculateAttachmentStyle(answers) {
    const attachmentIndicators = {
      reassuranceNeed: answers[6],           // Q6: "I need reassurance regularly"
      personalSpaceNeed: answers[7],         // Q7: "Personal space is essential"
      partnerResponseToUpset: answers[8],    // Q8: "When partner upset, I..."
      emotionalVulnerability: answers[9],    // Q9: "Comfortable with vulnerability"
      anxietyFromNoContact: answers[19],     // Q19: "Anxious when no contact"
      frequentCommunication: answers[21],    // Q21: "Need frequent communication"
      handleProblemsAlone: answers[22],      // Q22: "Handle problems alone"
      expressNeedsDirectly: answers[23]      // Q23: "Express needs directly"
    };

    let anxiousScore = 0;
    let avoidantScore = 0;
    let secureScore = 0;

    // === ANXIOUS ATTACHMENT INDICATORS ===
    if (attachmentIndicators.reassuranceNeed >= 4) anxiousScore += 25;
    else if (attachmentIndicators.reassuranceNeed >= 3) anxiousScore += 15;
    
    if (attachmentIndicators.frequentCommunication >= 4) anxiousScore += 25;
    else if (attachmentIndicators.frequentCommunication >= 3) anxiousScore += 15;
    
    if (attachmentIndicators.anxietyFromNoContact >= 4) anxiousScore += 30;
    else if (attachmentIndicators.anxietyFromNoContact >= 3) anxiousScore += 20;
    
    if (attachmentIndicators.partnerResponseToUpset === 4) anxiousScore += 20;

    // === AVOIDANT ATTACHMENT INDICATORS ===
    if (attachmentIndicators.personalSpaceNeed >= 4) avoidantScore += 30;
    else if (attachmentIndicators.personalSpaceNeed >= 3) avoidantScore += 15;
    
    if (attachmentIndicators.emotionalVulnerability <= 2) avoidantScore += 30;
    else if (attachmentIndicators.emotionalVulnerability === 3) avoidantScore += 15;
    
    if (attachmentIndicators.handleProblemsAlone >= 4) avoidantScore += 25;
    else if (attachmentIndicators.handleProblemsAlone >= 3) avoidantScore += 15;
    
    if (attachmentIndicators.partnerResponseToUpset === 2) avoidantScore += 15;

    // === SECURE ATTACHMENT INDICATORS ===
    if (attachmentIndicators.expressNeedsDirectly >= 4) secureScore += 30;
    else if (attachmentIndicators.expressNeedsDirectly >= 3) secureScore += 20;
    
    if (attachmentIndicators.emotionalVulnerability >= 4) secureScore += 30;
    else if (attachmentIndicators.emotionalVulnerability === 3) secureScore += 15;
    
    if (attachmentIndicators.reassuranceNeed === 3) secureScore += 20;
    
    if (attachmentIndicators.personalSpaceNeed === 3) secureScore += 20;

    // Normalize scores
    const totalScore = anxiousScore + avoidantScore + secureScore;
    if (totalScore > 0) {
      anxiousScore = (anxiousScore / totalScore) * 100;
      avoidantScore = (avoidantScore / totalScore) * 100;
      secureScore = (secureScore / totalScore) * 100;
    }

    return {
      attachment: this.classifyAttachment(anxiousScore, avoidantScore, secureScore),
      scores: {
        secure: Math.round(secureScore),
        anxious: Math.round(anxiousScore),
        avoidant: Math.round(avoidantScore)
      }
    };
  }

  classifyAttachment(anxious, avoidant, secure) {
    if (secure > 50 && secure > anxious && secure > avoidant) {
      return 'Secure';
    }
    if (anxious > avoidant && anxious > 35) {
      return 'Anxious-Preoccupied';
    }
    if (avoidant > anxious && avoidant > 35) {
      return 'Dismissive-Avoidant';
    }
    if (anxious > 30 && avoidant > 30) {
      return 'Fearful-Avoidant';
    }
    return 'Secure';
  }

  // ==================== LOVE LANGUAGE EXTRACTION ====================
  /**
   * Extract love language from Q5 answer
   */
  getLoveLanguage(answer) {
    const languages = {
      1: 'Words of Affirmation',
      2: 'Acts of Service',
      3: 'Receiving Gifts',
      4: 'Quality Time',
      5: 'Physical Touch'
    };
    return languages[answer] || 'Unknown';
  }

  // ==================== CONFLICT STYLE EXTRACTION ====================
  /**
   * Extract conflict resolution style from Q4 answer
   */
  getConflictStyle(answer) {
    const styles = {
      1: 'Direct Communicator',
      2: 'Reflective Processor',
      3: 'Conflict Avoider',
      4: 'Emotional Processor'
    };
    return styles[answer] || 'Unknown';
  }

  // ==================== PERSONALITY TYPE MAPPING ====================
  getPersonalityType(bigFive) {
    const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = bigFive;

    const personalityTypes = {
      'Charismatic Innovator': {
        condition: () => openness > 70 && extraversion > 70 && conscientiousness > 60,
        description: 'Creative, social, and organized. You inspire others with bold ideas.'
      },
      'Thoughtful Organizer': {
        condition: () => openness > 60 && conscientiousness > 75 && extraversion < 60,
        description: 'Organized and creative. You combine innovation with precision.'
      },
      'The Caring Organizer': {
        condition: () => conscientiousness > 70 && agreeableness > 75 && neuroticism < 50,
        description: 'Reliable and empathetic. You naturally support others.'
      },
      'Creative Connector': {
        condition: () => openness > 70 && extraversion > 70 && agreeableness > 65,
        description: 'Spontaneous and people-oriented. You thrive in dynamic environments.'
      },
      'Ambitious Achiever': {
        condition: () => extraversion > 70 && conscientiousness > 70 && agreeableness < 60,
        description: 'Driven and competitive. You aim high and work hard to succeed.'
      },
      'Steady Support': {
        condition: () => agreeableness > 75 && neuroticism < 40 && extraversion < 50,
        description: 'Calm and deeply empathetic. Others trust you completely.'
      },
      'Creative Empath': {
        condition: () => openness > 70 && agreeableness > 70 && neuroticism > 50,
        description: 'Imaginative and compassionate. Highly sensitive to feelings.'
      },
      'Commanding Executive': {
        condition: () => extraversion > 70 && conscientiousness > 70 && agreeableness < 50,
        description: 'Direct and results-focused. You naturally lead effectively.'
      },
      'Balanced Individual': {
        condition: () => true,
        description: 'You display a balanced combination of traits.'
      }
    };

    for (const [typeName, typeData] of Object.entries(personalityTypes)) {
      if (typeData.condition()) {
        return { type: typeName, description: typeData.description };
      }
    }

    return { type: 'Balanced Individual', description: 'You display a balanced combination of traits.' };
  }

  // ==================== ENNEAGRAM TYPE CALCULATION ====================
  calculateEnneagramType(bigFive) {
    const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = bigFive;

    const typeScores = {
      1: (conscientiousness * 0.4) + ((100 - neuroticism) * 0.3) + ((100 - agreeableness) * 0.3),
      2: (agreeableness * 0.5) + ((100 - openness) * 0.3) + (extraversion * 0.2),
      3: (extraversion * 0.4) + (conscientiousness * 0.3) + ((100 - neuroticism) * 0.3),
      4: (openness * 0.4) + (neuroticism * 0.3) + ((100 - agreeableness) * 0.3),
      5: (openness * 0.4) + ((100 - extraversion) * 0.4) + ((100 - agreeableness) * 0.2),
      6: (agreeableness * 0.3) + (neuroticism * 0.4) + ((100 - openness) * 0.3),
      7: (extraversion * 0.4) + (openness * 0.4) + ((100 - neuroticism) * 0.2),
      8: (extraversion * 0.4) + ((100 - agreeableness) * 0.4) + (conscientiousness * 0.2),
      9: ((100 - neuroticism) * 0.4) + ((100 - extraversion) * 0.3) + (agreeableness * 0.3)
    };

    return Object.keys(typeScores).reduce((a, b) => typeScores[a] > typeScores[b] ? a : b);
  }

  // ==================== DETAILED INSIGHTS GENERATION ====================
  generateInsights(bigFive, enneagramType, attachmentStyle, loveLanguage, conflictStyle) {
    const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = bigFive;

    const insights = {
      strengths: [],
      developmentAreas: [],
      communicationStyle: '',
      stressResponse: '',
      relationshipApproach: '',
      attachmentStyle: attachmentStyle.attachment,
      loveLanguage: loveLanguage,
      conflictStyle: conflictStyle,
      decisionMakingStyle: '',
      workStyle: '',
      careerSuggestions: [],
      compatibility: {
        compatibleAttachmentTypes: [],
        relationshipChallenges: [],
        relationshipStrengths: []
      }
    };

    // STRENGTHS
    if (conscientiousness > 70) insights.strengths.push('Reliability and organization');
    if (agreeableness > 70) insights.strengths.push('Empathy and cooperation');
    if (extraversion > 70) insights.strengths.push('Leadership and social influence');
    if (openness > 70) insights.strengths.push('Creativity and innovation');
    if (neuroticism < 40) insights.strengths.push('Emotional stability and resilience');

    // DEVELOPMENT AREAS
    if (conscientiousness < 40) insights.developmentAreas.push('Organization and planning');
    if (agreeableness < 40) insights.developmentAreas.push('Collaboration and empathy');
    if (extraversion < 40) insights.developmentAreas.push('Social confidence');
    if (openness < 40) insights.developmentAreas.push('Adaptability to change');
    if (neuroticism > 60) insights.developmentAreas.push('Stress management');

    // COMMUNICATION STYLE
    if (extraversion > 65 && agreeableness > 65) {
      insights.communicationStyle = 'Warm, engaging, and collaborative.';
    } else if (extraversion > 65 && agreeableness < 50) {
      insights.communicationStyle = 'Direct, confident, and commanding.';
    } else if (extraversion < 50 && agreeableness > 65) {
      insights.communicationStyle = 'Thoughtful and considerate.';
    } else {
      insights.communicationStyle = 'Balanced and situational.';
    }

    // STRESS RESPONSE
    if (neuroticism > 60) {
      insights.stressResponse = 'You feel stress deeply. Seek support from trusted people.';
    } else if (neuroticism > 40 && neuroticism < 60) {
      insights.stressResponse = 'You handle stress reasonably well, taking time to think things through.';
    } else {
      insights.stressResponse = 'You remain calm under pressure and process challenges logically.';
    }

    // RELATIONSHIP APPROACH (attachment-based)
    if (attachmentStyle.attachment === 'Secure') {
      insights.relationshipApproach = 'You feel comfortable with both closeness and independence.';
      insights.compatibility.relationshipStrengths.push('Healthy balance of intimacy and autonomy');
      insights.compatibility.compatibleAttachmentTypes.push('Secure', 'Anxious', 'Avoidant');
    } else if (attachmentStyle.attachment === 'Anxious-Preoccupied') {
      insights.relationshipApproach = 'You desire closeness and reassurance. You are emotionally expressive.';
      insights.compatibility.relationshipChallenges.push('May need reassurance during partner\'s independent time');
      insights.compatibility.compatibleAttachmentTypes.push('Secure', 'Anxious');
    } else if (attachmentStyle.attachment === 'Dismissive-Avoidant') {
      insights.relationshipApproach = 'You value independence and emotional distance. You are dependable.';
      insights.compatibility.relationshipChallenges.push('May create distance when partner seeks intimacy');
      insights.compatibility.compatibleAttachmentTypes.push('Secure', 'Avoidant');
    } else if (attachmentStyle.attachment === 'Fearful-Avoidant') {
      insights.relationshipApproach = 'You have mixed feelings about intimacy. Building trust is important.';
      insights.compatibility.relationshipChallenges.push('May alternate between seeking and avoiding closeness');
      insights.compatibility.compatibleAttachmentTypes.push('Secure');
    }

    // CAREER SUGGESTIONS
    insights.careerSuggestions = this.getCareerSuggestions(bigFive);

    return insights;
  }

  getCareerSuggestions(bigFive) {
    const { openness, conscientiousness, extraversion, agreeableness } = bigFive;
    const careers = [];

    if (conscientiousness > 65 && agreeableness > 65) {
      careers.push('Teacher', 'Project Manager', 'Healthcare Professional', 'Counselor');
    }
    if (openness > 70) {
      careers.push('Designer', 'Architect', 'Researcher', 'Scientist');
    }
    if (extraversion > 65 && conscientiousness > 65) {
      careers.push('Executive', 'Sales Manager', 'Team Lead');
    }

    return careers.length > 0 ? careers : ['Diverse career paths'];
  }
}

module.exports = new PersonalityCalculator();