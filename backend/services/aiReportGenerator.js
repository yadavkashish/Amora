class AIReportGenerator {
  constructor() {
    console.log("✅ Using enhanced, highly varied personality report generator");
  }

  async generateReport(bigFive, enneagramType, answers = {}, metadata = {}) {
    try {
      console.log("🧠 Generating highly personalized and unique report...");

      const report = {
        personalityNarrative: this.generateNarrative(bigFive, enneagramType),
        personalityType: this.getPersonalityType(bigFive, enneagramType),
        strengths: this.generateStrengths(bigFive),
        developmentAreas: this.generateDevelopmentAreas(bigFive),
        communicationStyle: this.generateCommunicationStyle(bigFive),
        stressResponse: this.generateStressResponse(bigFive),
        relationshipApproach: this.generateRelationshipApproach(bigFive),
        intimacyPreference: this.generateIntimacyPreference(bigFive),
        idealPartnerProfile: this.generateIdealPartner(bigFive, enneagramType),
        conflictResolutionStyle: this.generateConflictStyle(bigFive),
        redFlags: this.generateRedFlags(bigFive),
        dateIdeas: this.generateDateIdeas(bigFive),
        conversationStarters: this.generateConversationStarters(bigFive),
        compatibleTypes: this.getCompatibleTypes(enneagramType),
        careerSuggestions: this.generateCareerSuggestions(bigFive),
        actionItems: this.generateActionItems(bigFive, enneagramType),
        generatedAt: new Date(),
        aiProvider: "local-enhanced-generator",
      };

      console.log("✅ Unique personalized report generated successfully");
      return report;
    } catch (error) {
      console.error("❌ Error generating report:", error);
      throw error;
    }
  }

  // Granular scoring buckets for detailed variation
  getScoreBucket(score) {
    if (score >= 80) return "very_high";
    if (score >= 65) return "high";
    if (score >= 55) return "moderate_high";
    if (score >= 45) return "balanced";
    if (score >= 35) return "moderate_low";
    if (score >= 20) return "low";
    return "very_low";
  }

  generateNarrative(bigFive, enneagramType) {
    const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = bigFive;

    let narrative = `As an Enneagram Type ${enneagramType} (${this.getEnneagramName(enneagramType)}), `;

    if (extraversion > 70) narrative += "you're naturally outgoing and thrive in shared experiences. ";
    else if (extraversion > 55) narrative += "you enjoy connecting deeply while valuing your personal space. ";
    else narrative += "you prefer calm, intimate settings and deep conversations. ";

    if (conscientiousness > 70) narrative += "Your organization and sense of purpose inspire trust. ";
    else if (conscientiousness > 55) narrative += "You balance structure with flexibility. ";
    else narrative += "You value freedom and spontaneity in your routines. ";

    if (agreeableness > 70) narrative += "You lead with empathy and prioritize emotional harmony. ";
    else if (agreeableness > 55) narrative += "You care deeply for others while maintaining personal boundaries. ";
    else narrative += "You appreciate honesty and prefer direct communication. ";

    if (openness > 70) narrative += "Creativity fuels your personal growth and self-expression. ";
    else narrative += "You appreciate simplicity, focusing on meaningful, practical experiences. ";

    return narrative.trim();
  }

  getPersonalityType(bigFive, enneagramType) {
    const { openness, conscientiousness } = bigFive;
    const opennessLabel = openness > 60 ? "Visionary" : openness > 40 ? "Balanced" : "Grounded";
    const conscientiousnessLabel =
      conscientiousness > 60 ? "Achiever" : conscientiousness > 40 ? "Adaptive" : "Free Spirit";

    return {
      name: `${opennessLabel} ${conscientiousnessLabel}`,
      description: `A ${this.getEnneagramName(enneagramType)} archetype who balances ${opennessLabel.toLowerCase()} creativity with ${conscientiousnessLabel.toLowerCase()} discipline.`,
    };
  }

  getEnneagramName(type) {
    const typeNames = {
      1: "The Perfectionist",
      2: "The Helper",
      3: "The Achiever",
      4: "The Individualist",
      5: "The Investigator",
      6: "The Loyalist",
      7: "The Enthusiast",
      8: "The Challenger",
      9: "The Peacemaker",
    };
    return typeNames[type] || "Unknown Type";
  }

  generateStrengths(bigFive) {
    const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = bigFive;
    const strengths = [];

    if (openness > 65) strengths.push("Creative and open-minded thinker");
    if (conscientiousness > 65) strengths.push("Highly reliable and disciplined");
    if (extraversion > 65) strengths.push("Confident communicator and motivator");
    if (agreeableness > 65) strengths.push("Empathetic and emotionally intelligent");
    if (neuroticism < 45) strengths.push("Calm and grounded under stress");

    return strengths.length ? strengths : ["Adaptable", "Emotionally aware", "Balanced mindset"];
  }

  generateDevelopmentAreas(bigFive) {
    const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = bigFive;
    const areas = [];

    if (openness < 40) areas.push("Be open to exploring new ideas and change");
    if (conscientiousness < 40) areas.push("Develop stronger consistency and structure");
    if (extraversion < 40) areas.push("Engage more in collaborative settings");
    if (agreeableness < 40) areas.push("Be mindful of how direct feedback is delivered");
    if (neuroticism > 60) areas.push("Practice stress management and emotional grounding");

    return areas.length ? areas : ["Maintain balance and continue self-growth"];
  }

  generateCommunicationStyle(bigFive) {
    const { extraversion, agreeableness } = bigFive;

    if (extraversion > 70 && agreeableness > 60)
      return "You’re expressive and compassionate, easily connecting with others.";
    if (extraversion > 60)
      return "You’re engaging and confident, speaking with clarity and enthusiasm.";
    if (extraversion < 40)
      return "You prefer thoughtful and deep one-on-one conversations.";
    return "You communicate clearly and adapt your tone based on the situation.";
  }

  generateStressResponse(bigFive) {
    const { neuroticism } = bigFive;
    if (neuroticism > 70) return "You feel emotions deeply and benefit from mindfulness and reflection.";
    if (neuroticism > 50) return "You process stress through expression and social support.";
    return "You handle stress calmly and focus on constructive solutions.";
  }

  generateRelationshipApproach(bigFive) {
    const { agreeableness } = bigFive;
    if (agreeableness > 70)
      return "You value emotional closeness and nurture relationships with warmth and care.";
    if (agreeableness > 55)
      return "You seek balance between independence and emotional connection.";
    return "You prefer relationships rooted in honesty and respect for individuality.";
  }

  generateIntimacyPreference(bigFive) {
    const { openness, extraversion, agreeableness } = bigFive;
    if (openness > 70) return "You crave emotional and intellectual connection in intimacy.";
    if (agreeableness > 70) return "You show love through tenderness and trust.";
    if (extraversion > 70) return "You express intimacy through shared experiences and affection.";
    return "You value slow-building intimacy grounded in emotional safety.";
  }

  generateIdealPartner(bigFive, enneagramType) {
    const { conscientiousness, agreeableness, openness } = bigFive;
    let partner = "Your ideal partner is someone who ";

    if (agreeableness > 60) partner += "is emotionally intelligent and supportive. ";
    if (conscientiousness > 60) partner += "shares your commitment and discipline. ";
    if (openness > 60) partner += "inspires your curiosity and creativity. ";
    else partner += "grounds you with stability and consistency. ";

    partner += `They complement your Enneagram Type ${this.getEnneagramName(enneagramType)} traits.`;
    return partner;
  }

  generateConflictStyle(bigFive) {
    const { agreeableness } = bigFive;
    if (agreeableness > 70) return "You avoid unnecessary conflict and focus on understanding both sides.";
    if (agreeableness > 55) return "You’re calm but assertive, resolving issues through dialogue.";
    return "You prefer honesty over harmony, addressing issues directly.";
  }

  generateRedFlags(bigFive) {
    const flags = [];
    const { neuroticism, conscientiousness, agreeableness } = bigFive;

    if (neuroticism > 65) flags.push("Overthinking emotional situations");
    if (agreeableness < 40) flags.push("Being overly blunt or distant");
    if (conscientiousness < 40) flags.push("Inconsistency or lack of reliability");

    return flags.length ? flags : ["Difficulty with emotional boundaries"];
  }

  generateDateIdeas(bigFive) {
    const { openness, extraversion } = bigFive;
    const ideas = [];

    if (openness > 70)
      ideas.push({ idea: "Art class or museum visit", reason: "Encourages creativity and conversation" });
    if (extraversion > 70)
      ideas.push({ idea: "Outdoor concert or group game", reason: "You thrive in shared energy experiences" });
    else
      ideas.push({ idea: "Quiet dinner or nature walk", reason: "Promotes emotional connection and peace" });

    return ideas.slice(0, 3);
  }

  generateConversationStarters(bigFive) {
    const { openness } = bigFive;
    const starters = [
      "What are you most passionate about right now?",
      "What values matter most to you in life?",
      "When do you feel most at peace?",
    ];

    if (openness > 60)
      starters.push("What’s a dream project you’d love to bring to life?");
    else starters.push("What’s your favorite way to unwind after a long day?");

    starters.push("What's a recent experience that changed your perspective?");
    starters.push("What do you want in a partner?");

    return starters.slice(0, 6);
  }

  getCompatibleTypes(enneagramType) {
    const pairs = {
      1: ["The Helper", "The Enthusiast", "The Peacemaker"],
      2: ["The Perfectionist", "The Achiever", "The Challenger"],
      3: ["The Helper", "The Individualist", "The Peacemaker"],
      4: ["The Perfectionist", "The Investigator", "The Peacemaker"],
      5: ["The Individualist", "The Loyalist", "The Enthusiast"],
      6: ["The Achiever", "The Investigator", "The Peacemaker"],
      7: ["The Perfectionist", "The Individualist", "The Peacemaker"],
      8: ["The Helper", "The Investigator", "The Peacemaker"],
      9: ["The Perfectionist", "The Achiever", "The Enthusiast"],
    };
    return pairs[enneagramType] || ["The Perfectionist", "The Peacemaker"];
  }

  generateCareerSuggestions(bigFive) {
    const { openness, conscientiousness } = bigFive;
    const careers = [];

    if (openness > 70) careers.push("Creative design, media, or writing");
    if (conscientiousness > 70) careers.push("Project management, finance, or operations");
    if (openness > 60 && conscientiousness > 60) careers.push("Entrepreneurship or innovation roles");
    if (careers.length === 0) careers.push("Teaching, research, or communication roles");

    return careers;
  }

  generateActionItems(bigFive, enneagramType) {
    return [
      "Reflect weekly on emotional growth or communication habits.",
      "Engage in one activity that challenges your comfort zone.",
      "Nurture both solitude and social connection equally.",
      `Learn more about how Enneagram Type ${this.getEnneagramName(enneagramType)} expresses growth.`,
    ];
  }
}

module.exports = new AIReportGenerator();
