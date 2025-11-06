class AIReportGenerator {
  constructor() {
    // Template-based approach - no API calls needed
  }

  async generateReport(bigFive, enneagramType, answers = {}, metadata = {}) {
    try {
      const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = bigFive;

      // Generate report from templates based on personality scores
      const report = {
        personalityNarrative: this.generateNarrative(bigFive, enneagramType),
        personalityType: {
          name: this.getPersonalityTypeName(bigFive, enneagramType),
          description: this.getPersonalityTypeDescription(bigFive, enneagramType),
        },
        strengths: this.generateStrengths(bigFive),
        developmentAreas: this.generateDevelopmentAreas(bigFive),
        communicationStyle: this.generateCommunicationStyle(bigFive),
        stressResponse: this.generateStressResponse(bigFive),
        relationshipApproach: this.generateRelationshipApproach(bigFive),
        intimacyPreference: this.generateIntimacyPreference(bigFive),
        conflictResolutionStyle: this.generateConflictStyle(bigFive),
        redFlags: this.generateRedFlags(bigFive),
        dateIdeas: this.generateDateIdeas(bigFive),
        conversationStarters: this.generateConversationStarters(bigFive),
        compatibleTypes: this.generateCompatibleTypes(enneagramType),
        careerSuggestions: this.generateCareerSuggestions(bigFive),
        actionItems: this.generateActionItems(bigFive),
        idealPartnerProfile: this.generateIdealPartnerProfile(bigFive),
      };

      console.log("✅ Report generated successfully from templates");
      return report;
    } catch (error) {
      console.error("❌ Error generating report:", error);
      throw error;
    }
  }

  generateNarrative(bigFive, enneagramType) {
    const traits = [];
    if (bigFive.openness > 60) traits.push("imaginative and open-minded");
    if (bigFive.extraversion > 60) traits.push("outgoing and sociable");
    if (bigFive.conscientiousness > 60) traits.push("organized and reliable");
    if (bigFive.agreeableness > 60) traits.push("empathetic and compassionate");
    if (bigFive.neuroticism < 40) traits.push("emotionally stable");

    const traitStr = traits.length > 0 ? traits.join(", ") : "a unique and balanced individual";
    return `You are ${traitStr}. Enneagram Type ${enneagramType} - a natural leader with deep emotional intelligence who brings authenticity and warmth to every relationship.`;
  }

  getPersonalityTypeName(bigFive, enneagramType) {
    const names = [
      "The Thoughtful Visionary",
      "The Charismatic Leader",
      "The Balanced Connector",
      "The Creative Soul",
      "The Steady Guardian",
      "The Passionate Advocate",
      "The Wisdom Seeker",
      "The Dynamic Achiever",
      "The Peaceful Mediator",
    ];
    return names[enneagramType - 1] || "The Unique Individual";
  }

  getPersonalityTypeDescription(bigFive, enneagramType) {
    return `As Enneagram Type ${enneagramType}, you naturally embody unique strengths that make you valuable in relationships. Your personality brings authenticity and depth to everything you do.`;
  }

  generateStrengths(bigFive) {
    const strengths = [];
    if (bigFive.conscientiousness > 60) strengths.push("Strong organizational and planning abilities");
    if (bigFive.agreeableness > 60) strengths.push("Natural empathy and compassion for others");
    if (bigFive.extraversion > 60) strengths.push("Excellent communication and social skills");
    if (bigFive.openness > 60) strengths.push("Creative thinking and adaptability");
    if (bigFive.neuroticism < 40) strengths.push("Emotional stability and resilience");
    return strengths.length > 0 ? strengths : ["Authentic presence", "Genuine care", "Personal integrity"];
  }

  generateDevelopmentAreas(bigFive) {
    const areas = [];
    if (bigFive.conscientiousness < 50) areas.push("Improving focus and follow-through on commitments");
    if (bigFive.agreeableness < 50) areas.push("Learning to set healthy boundaries");
    if (bigFive.extraversion < 50) areas.push("Building confidence in social situations");
    if (bigFive.openness < 50) areas.push("Embracing new experiences and perspectives");
    if (bigFive.neuroticism > 60) areas.push("Managing stress and anxiety more effectively");
    return areas.length > 0 ? areas : ["Self-reflection", "Personal growth", "Mindfulness"];
  }

  generateCommunicationStyle(bigFive) {
    if (bigFive.extraversion > 65 && bigFive.agreeableness > 65)
      return "You communicate with warmth, enthusiasm, and genuine interest in others. You naturally draw people in with your open and engaging manner.";
    if (bigFive.extraversion > 65) return "Direct, confident, and articulate. You speak with clarity and authority.";
    if (bigFive.agreeableness > 65)
      return "Thoughtful and considerate. You listen deeply and respond with care and understanding.";
    return "Balanced and adaptive. You adjust your communication style based on the situation and the person.";
  }

  generateStressResponse(bigFive) {
    if (bigFive.neuroticism > 60)
      return "You feel stress deeply and need time to process emotions. Seek support from trusted people and practice self-care.";
    if (bigFive.neuroticism > 40)
      return "You handle stress reasonably well, taking time to think through problems before acting.";
    return "You remain calm under pressure and process challenges logically, helping others feel at ease.";
  }

  generateRelationshipApproach(bigFive) {
    if (bigFive.agreeableness > 70)
      return "You prioritize harmony, deep connection, and loyalty. You are naturally supportive and selfless in relationships.";
    if (bigFive.extraversion > 70) return "You bring energy, excitement, and social confidence to relationships.";
    return "You value depth over breadth, building strong, meaningful one-on-one connections.";
  }

  generateIntimacyPreference(bigFive) {
    if (bigFive.agreeableness > 70)
      return "You seek genuine emotional intimacy and physical affection that expresses deep commitment and care.";
    if (bigFive.openness > 70) return "You appreciate spontaneity and creative expression in both emotional and physical intimacy.";
    return "You value trust, consistency, and slow-building intimacy that deepens over time.";
  }

  generateConflictStyle(bigFive) {
    if (bigFive.agreeableness > 65)
      return "You prefer harmony and seek to understand the other person's perspective. You work to find win-win solutions.";
    if (bigFive.conscientiousness > 65) return "You address issues directly and systematically, focusing on solutions.";
    return "You balance logic with empathy, listening and expressing your needs clearly.";
  }

  generateRedFlags(bigFive) {
    const flags = [];
    if (bigFive.agreeableness > 75) flags.push("Being overly people-pleasing at the expense of your own needs");
    if (bigFive.neuroticism > 65) flags.push("Letting anxiety or insecurity override your judgment");
    if (bigFive.extraversion < 40) flags.push("Withdrawing or isolating when stressed");
    if (bigFive.openness < 40) flags.push("Resisting new experiences or dismissing different perspectives");
    return flags.length > 0 ? flags : ["Be aware of patterns", "Stay self-aware", "Communicate openly"];
  }

  generateDateIdeas(bigFive) {
    const ideas = [
      { idea: "Coffee at a cozy café", reason: "Perfect for conversation and getting to know each other" },
      { idea: "Walk in nature", reason: "Relaxing and allows for natural conversation flow" },
      { idea: "Trying a new restaurant", reason: "Shares an experience and conversation starter" },
    ];
    if (bigFive.extraversion > 65) {
      ideas.push({ idea: "Live music or events", reason: "Your energy thrives in vibrant social settings" });
    }
    if (bigFive.openness > 65) {
      ideas.push({
        idea: "Art gallery or museum",
        reason: "Stimulates interesting conversations and creative thinking",
      });
    }
    return ideas;
  }

  generateConversationStarters(bigFive) {
    return [
      "What's a recent experience that changed your perspective?",
      "What do you value most in the people you're close to?",
      "Tell me about a goal you're passionate about",
      "What's your favorite way to spend a relaxing day?",
      "What's a book, movie, or show that resonated with you?",
      "How do you like to celebrate successes with others?",
    ];
  }

  generateCompatibleTypes(enneagramType) {
    const compatibility = {
      1: ["2", "7", "9"],
      2: ["1", "3", "4"],
      3: ["6", "9", "2"],
      4: ["5", "9", "1"],
      5: ["4", "6", "7"],
      6: ["9", "5", "8"],
      7: ["1", "9", "5"],
      8: ["2", "3", "9"],
      9: ["3", "6", "1"],
    };
    return (compatibility[enneagramType] || []).map((t) => `Type ${t}`);
  }

  generateCareerSuggestions(bigFive) {
    const careers = [];
    if (bigFive.conscientiousness > 65 && bigFive.agreeableness > 65)
      careers.push("Teacher", "Counselor", "Project Manager", "Healthcare Professional");
    if (bigFive.openness > 70) careers.push("Designer", "Entrepreneur", "Researcher", "Creative Director");
    if (bigFive.extraversion > 65) careers.push("Sales", "Marketing", "HR Manager", "Public Relations");
    return careers.length > 0 ? careers : ["Diverse career paths available"];
  }

  generateActionItems(bigFive) {
    return [
      "Reflect on your core values and share them with your partner",
      "Practice active listening in conversations",
      "Set healthy boundaries that work for you",
      "Schedule regular quality time",
      "Communicate openly about needs and expectations",
    ];
  }

  generateIdealPartnerProfile(bigFive) {
    const qualities = [];
    if (bigFive.agreeableness > 70) qualities.push("emotionally intelligent");
    if (bigFive.extraversion > 70) qualities.push("social and outgoing");
    if (bigFive.conscientiousness > 70) qualities.push("reliable and organized");
    if (bigFive.openness > 70) qualities.push("curious and open-minded");

    const profile = qualities.join(", ") || "authentic and genuine";
    return `Your ideal partner is someone who is ${profile}. You value honesty, emotional depth, and genuine connection above all else.`;
  }
}

module.exports = new AIReportGenerator();



/////////////////////////////////////////////////////////////////////////////

// const axios = require("axios");

// class AIReportGenerator {
//   constructor() {
//     if (!process.env.HUGGINGFACE_API_TOKEN) {
//       throw new Error("❌ Missing HUGGINGFACE_API_TOKEN in .env");
//     }

//     this.apiToken = process.env.HUGGINGFACE_API_TOKEN;

//     // ✅ Correct router API endpoint (no `/models/`)
//     this.apiUrl = "https://router.huggingface.co/hf-inference/google/gemma-7b-it";
//   }

//   async generateReport(bigFive, enneagramType, answers, metadata = {}) {
//     try {
//       console.log("🧠 Sending request to Hugging Face Router API...");

//       const prompt = `
//         You are an expert psychologist generating a detailed personality and compatibility report.
//         Based on the following data, create a JSON object with keys:
//         personalityType, personalityNarrative, strengths, developmentAreas,
//         communicationStyle, stressResponse, conflictResolutionStyle, careerSuggestions,
//         relationshipApproach, intimacyPreference, compatibleTypes,
//         actionItems, dateIdeas, conversationStarters, redFlags, idealPartnerProfile.

//         Data:
//         Big Five: ${JSON.stringify(bigFive)}
//         Enneagram Type: ${enneagramType}
//         Answers: ${JSON.stringify(answers)}
//         Metadata: ${JSON.stringify(metadata)}
//       `;

//       const response = await axios.post(
//         this.apiUrl,
//         { inputs: prompt },
//         {
//           headers: {
//             Authorization: `Bearer ${this.apiToken}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const text =
//         response.data?.generated_text ||
//         response.data?.[0]?.generated_text ||
//         response.data?.[0]?.output_text ||
//         JSON.stringify(response.data);

//       if (!text) {
//         throw new Error("❌ No generated text from Hugging Face response.");
//       }

//       const jsonMatch = text.match(/\{[\s\S]*\}/);
//       if (!jsonMatch) {
//         throw new Error("❌ No JSON found in generated text.");
//       }

//       return JSON.parse(jsonMatch[0]);
//     } catch (error) {
//       console.error("❌ Hugging Face API error:", error.response?.data || error.message);
//       throw new Error(
//         "Failed to generate report: " +
//           (error.response?.data?.error || error.message)
//       );
//     }
//   }
// }

// module.exports = new AIReportGenerator();

