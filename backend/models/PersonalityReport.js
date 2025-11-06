const mongoose = require("mongoose");

const personalityReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: true,
  },

  // Raw answers from quiz
  answers: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },

  // Big Five Scores (0-100)
  bigFive: {
    openness: Number,
    conscientiousness: Number,
    extraversion: Number,
    agreeableness: Number,
    neuroticism: Number,
  },

  // Enneagram Type
  enneagramType: {
    type: Number,
    min: 1,
    max: 9,
  },

  // ✅ AI-Generated Report Data
  aiGeneratedReport: {
    personalityNarrative: String,
    personalityType: {
      name: String,
      description: String,
    },
    strengths: [String],
    developmentAreas: [String],
    communicationStyle: String,
    stressResponse: String,
    relationshipApproach: String,
    intimacyPreference: String,
    idealPartnerProfile: String,
    conflictResolutionStyle: String,
    redFlags: [String],
    dateIdeas: [
      {
        idea: String,
        reason: String,
      },
    ],
    conversationStarters: [String],
    compatibleTypes: [String],
    careerSuggestions: [String],
    actionItems: [String],
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    aiProvider: {
      type: String,
      enum: ["gemini", "openai", "local", "huggingface"],  // ✅ UPDATED
      default: "local",  // ✅ UPDATED
    },
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },

  reportVersion: {
    type: Number,
    default: 1,
  },
});

module.exports = mongoose.model("PersonalityReport", personalityReportSchema);
