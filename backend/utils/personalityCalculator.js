class PersonalityCalculator {
  // ==================== BIG FIVE CALCULATION ====================
  
  calculateBigFive(answers) {
    const scores = {
      openness: 0,
      conscientiousness: 0,
      extraversion: 0,
      agreeableness: 0,
      neuroticism: 0
    };

    const questionMappings = {
      // Openness questions (IDs: 12, 14, 2, 5 from personality report quiz)
      openness: {
        questions: [101, 102, 103, 104, 105],
        weight: 1
      },
      // Conscientiousness
      conscientiousness: {
        questions: [106, 107, 108, 109],
        weight: 1
      },
      // Extraversion
      extraversion: {
        questions: [110, 111, 112, 113],
        weight: 1
      },
      // Agreeableness
      agreeableness: {
        questions: [114, 115, 116, 117],
        weight: 1
      },
      // Neuroticism (emotional stability - reverse scored)
      neuroticism: {
        questions: [118, 119, 120],
        weight: 1,
        reverseScore: true
      }
    };

    // Calculate each dimension
    Object.keys(questionMappings).forEach(dimension => {
      const mapping = questionMappings[dimension];
      let total = 0;
      let count = 0;

      mapping.questions.forEach(questionId => {
        const answer = answers[questionId];
        if (answer !== undefined) {
          let score = answer;
          
          // Reverse scoring for neuroticism
          if (mapping.reverseScore) {
            score = 6 - answer; // Assuming 1-5 scale
          }
          
          total += score;
          count++;
        }
      });

      // Normalize to 0-100
      if (count > 0) {
        scores[dimension] = Math.round((total / (count * 5)) * 100);
      }
    });

    return scores;
  }

  // ==================== ENNEAGRAM TYPE CALCULATION ====================

  calculateEnneagramType(bigFive, answers) {
    const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = bigFive;

    // Enneagram typing logic based on Big Five
    // This is a simplified mapping - real Enneagram is more complex

    const typeScores = {
      1: 0, // Reformer - High conscientiousness, low neuroticism
      2: 0, // Helper - High agreeableness, low openness
      3: 0, // Achiever - High extraversion, high conscientiousness
      4: 0, // Individualist - High openness, high neuroticism
      5: 0, // Investigator - High openness, low extraversion
      6: 0, // Loyalist - High agreeableness, high neuroticism
      7: 0, // Enthusiast - High extraversion, high openness
      8: 0, // Challenger - Low agreeableness, high extraversion
      9: 0  // Peacemaker - Low neuroticism, low extraversion
    };

    // Type 1: Reformer (Perfectionist)
    typeScores[1] = (conscientiousness * 0.4) + ((100 - neuroticism) * 0.3) + ((100 - agreeableness) * 0.3);

    // Type 2: Helper (Giver)
    typeScores[2] = (agreeableness * 0.5) + ((100 - openness) * 0.3) + ((100 - extraversion) * 0.2);

    // Type 3: Achiever (Performer)
    typeScores[3] = (extraversion * 0.4) + (conscientiousness * 0.3) + ((100 - neuroticism) * 0.3);

    // Type 4: Individualist (Romantic)
    typeScores[4] = (openness * 0.4) + (neuroticism * 0.3) + ((100 - agreeableness) * 0.3);

    // Type 5: Investigator (Thinker)
    typeScores[5] = (openness * 0.4) + ((100 - extraversion) * 0.4) + ((100 - agreeableness) * 0.2);

    // Type 6: Loyalist (Skeptic)
    typeScores[6] = (agreeableness * 0.3) + (neuroticism * 0.4) + ((100 - openness) * 0.3);

    // Type 7: Enthusiast (Epicure)
    typeScores[7] = (extraversion * 0.4) + (openness * 0.4) + ((100 - neuroticism) * 0.2);

    // Type 8: Challenger (Leader)
    typeScores[8] = (extraversion * 0.4) + ((100 - agreeableness) * 0.4) + (conscientiousness * 0.2);

    // Type 9: Peacemaker (Mediator)
    typeScores[9] = ((100 - neuroticism) * 0.4) + ((100 - extraversion) * 0.3) + (agreeableness * 0.3);

    // Get highest scoring type
    const enneagramType = Object.keys(typeScores).reduce((a, b) =>
      typeScores[a] > typeScores[b] ? a : b
    );

    return parseInt(enneagramType);
  }

  // ==================== PERSONALITY TYPE MAPPING ====================

  getPersonalityType(bigFive) {
    const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = bigFive;

    const personalityTypes = {
      'Charismatic Innovator': {
        condition: () => openness > 70 && extraversion > 70 && conscientiousness > 60,
        description: 'Creative, social, and organized. You inspire others with bold ideas and get things done.'
      },
      'Thoughtful Organizer': {
        condition: () => openness > 60 && conscientiousness > 75 && extraversion < 60,
        description: 'Organized and creative, you value meaningful connections. You combine innovation with precision.'
      },
      'The Caring Organizer': {
        condition: () => conscientiousness > 70 && agreeableness > 75 && neuroticism < 50,
        description: 'Reliable, empathetic, and structured. You naturally support others while maintaining high standards.'
      },
      'Creative Connector': {
        condition: () => openness > 70 && extraversion > 70 && agreeableness > 65,
        description: 'Spontaneous and people-oriented, you thrive in dynamic environments with new connections and ideas.'
      },
      'Ambitious Achiever': {
        condition: () => extraversion > 70 && conscientiousness > 70 && agreeableness < 60,
        description: 'Driven and competitive, you aim high and work hard to succeed. You inspire through action.'
      },
      'Steady Support': {
        condition: () => agreeableness > 75 && neuroticism < 40 && extraversion < 50,
        description: 'Calm and deeply empathetic, you are reliable and supportive. Others trust you completely.'
      },
      'Creative Empath': {
        condition: () => openness > 70 && agreeableness > 70 && neuroticism > 50,
        description: 'Imaginative and compassionate, you see possibilities others miss. Highly sensitive to feelings.'
      },
      'Commanding Executive': {
        condition: () => extraversion > 70 && conscientiousness > 70 && agreeableness < 50,
        description: 'Direct and results-focused, you naturally lead and get things done. You value efficiency.'
      },
      'Balanced Individual': {
        condition: () => true, // Default fallback
        description: 'You display a balanced combination of traits, adapting well to different situations.'
      }
    };

    // Find matching personality type
    for (const [typeName, typeData] of Object.entries(personalityTypes)) {
      if (typeData.condition()) {
        return {
          type: typeName,
          description: typeData.description
        };
      }
    }

    return {
      type: 'Balanced Individual',
      description: 'You display a balanced combination of traits.'
    };
  }

  // ==================== DETAILED INSIGHTS GENERATION ====================

  generateInsights(bigFive, enneagramType) {
    const insights = {
      strengths: [],
      developmentAreas: [],
      communicationStyle: '',
      stressResponse: '',
      relationshipApproach: '',
      decisionMakingStyle: '',
      workStyle: '',
      careerSuggestions: [],
      compatibility: {
        compatibleTypes: [],
        avoidTypes: [],
        complementaryTraits: []
      }
    };

    const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = bigFive;

    // ===== STRENGTHS =====
    if (conscientiousness > 70) insights.strengths.push('Reliability and organization');
    if (agreeableness > 70) insights.strengths.push('Empathy and cooperation');
    if (extraversion > 70) insights.strengths.push('Leadership and social influence');
    if (openness > 70) insights.strengths.push('Creativity and innovation');
    if (neuroticism < 40) insights.strengths.push('Emotional stability and resilience');
    if (conscientiousness > 75 && agreeableness > 75) insights.strengths.push('Balanced judgment');

    // ===== DEVELOPMENT AREAS =====
    if (conscientiousness < 40) insights.developmentAreas.push('Organization and planning');
    if (agreeableness < 40) insights.developmentAreas.push('Collaboration and empathy');
    if (extraversion < 40) insights.developmentAreas.push('Social confidence and networking');
    if (openness < 40) insights.developmentAreas.push('Adaptability to change');
    if (neuroticism > 60) insights.developmentAreas.push('Stress management');

    // ===== COMMUNICATION STYLE =====
    if (extraversion > 65 && agreeableness > 65) {
      insights.communicationStyle = 'Warm, engaging, and collaborative. You naturally draw people in with your enthusiasm.';
    } else if (extraversion > 65 && agreeableness < 50) {
      insights.communicationStyle = 'Direct, confident, and commanding. You speak with authority and clarity.';
    } else if (extraversion < 50 && agreeableness > 65) {
      insights.communicationStyle = 'Thoughtful and considerate. You listen more than you speak but your words carry weight.';
    } else {
      insights.communicationStyle = 'Balanced and situational. You adapt your communication style to different contexts.';
    }

    // ===== STRESS RESPONSE =====
    if (neuroticism > 60) {
      insights.stressResponse = 'You feel stress deeply and need time to process. Seek support from trusted people.';
    } else if (neuroticism > 40 && neuroticism < 60) {
      insights.stressResponse = 'You handle stress reasonably well, taking time to think through problems.';
    } else {
      insights.stressResponse = 'You remain calm under pressure. You process challenges logically and move forward.';
    }

    // ===== RELATIONSHIP APPROACH =====
    if (agreeableness > 70) {
      insights.relationshipApproach = 'You prioritize harmony and deep connection. You are naturally supportive and loyal.';
    } else if (extraversion > 70) {
      insights.relationshipApproach = 'You bring energy and excitement to relationships. You enjoy social bonding.';
    } else {
      insights.relationshipApproach = 'You value depth over breadth. You build strong, meaningful relationships.';
    }

    // ===== DECISION MAKING STYLE =====
    if (conscientiousness > 70) {
      insights.decisionMakingStyle = 'You are thorough and analytical. You gather information before deciding.';
    } else if (openness > 70) {
      insights.decisionMakingStyle = 'You are creative and flexible. You consider unconventional options.';
    } else {
      insights.decisionMakingStyle = 'You use a balanced approach, combining logic with intuition.';
    }

    // ===== WORK STYLE =====
    if (conscientiousness > 70 && agreeableness > 70) {
      insights.workStyle = 'Team player who is organized and detail-oriented. You create stable, productive environments.';
    } else if (conscientiousness > 70 && extraversion > 65) {
      insights.workStyle = 'Natural leader who is well-organized. You inspire and direct teams effectively.';
    } else if (openness > 70) {
      insights.workStyle = 'Creative contributor who brings innovation. You thrive in dynamic environments.';
    } else {
      insights.workStyle = 'Reliable professional with steady output. You maintain quality consistently.';
    }

    // ===== CAREER SUGGESTIONS =====
    const careerMatrix = this.getCareerSuggestions(bigFive);
    insights.careerSuggestions = careerMatrix;

    // ===== COMPATIBILITY =====
    insights.compatibility = this.getCompatibilityInfo(bigFive, enneagramType);

    return insights;
  }

  getCareerSuggestions(bigFive) {
    const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = bigFive;
    const careers = [];

    // High conscientiousness + High agreeableness
    if (conscientiousness > 65 && agreeableness > 65) {
      careers.push('Teacher', 'Project Manager', 'Healthcare Professional', 'Social Worker');
    }

    // High openness + High creativity
    if (openness > 70) {
      careers.push('Designer', 'Architect', 'Researcher', 'Artist', 'Entrepreneur');
    }

    // High extraversion + High conscientiousness
    if (extraversion > 65 && conscientiousness > 65) {
      careers.push('Executive', 'Sales Manager', 'Event Planner', 'Consultant');
    }

    // High extraversion
    if (extraversion > 70 && conscientiousness < 60) {
      careers.push('Sales Representative', 'Marketing Manager', 'Public Relations Specialist');
    }

    // High openness + Low conscientiousness
    if (openness > 70 && conscientiousness < 50) {
      careers.push('Freelancer', 'Startup Founder', 'Creative Writer', 'Musician');
    }

    // Stable and organized
    if (conscientiousness > 75 && neuroticism < 40) {
      careers.push('Accountant', 'Engineer', 'Administrator', 'Analyst');
    }

    return careers.length > 0 ? careers : ['Diverse career paths are open to you'];
  }

  getCompatibilityInfo(bigFive, enneagramType) {
    const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = bigFive;

    const compatibility = {
      compatibleTypes: [],
      avoidTypes: [],
      complementaryTraits: []
    };

    // Compatible types (similar personalities)
    if (conscientiousness > 70 && agreeableness > 70) {
      compatibility.compatibleTypes.push('Other organized, empathetic individuals');
      compatibility.complementaryTraits.push('Someone with spontaneity to balance planning');
    }

    if (extraversion > 70) {
      compatibility.compatibleTypes.push('Other social, outgoing people');
      compatibility.complementaryTraits.push('Someone introverted but supportive');
    }

    if (openness > 70) {
      compatibility.compatibleTypes.push('Curious, creative individuals');
      compatibility.complementaryTraits.push('Someone grounded to balance exploration');
    }

    // Avoid types (opposite personalities)
    if (conscientiousness < 50) {
      compatibility.avoidTypes.push('Overly rigid, controlling individuals');
    }

    if (extraversion < 50) {
      compatibility.avoidTypes.push('Those who demand constant social engagement');
    }

    if (agreeableness < 50) {
      compatibility.avoidTypes.push('Very conflict-avoidant or passive people');
    }

    return compatibility;
  }
}

module.exports = new PersonalityCalculator();