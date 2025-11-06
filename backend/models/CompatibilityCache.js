const mongoose = require('mongoose')

const compatibilitySchema = new mongoose.Schema({
  user1Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Scores
  compatibility: Number,
  weightedCompatibility: Number,

  // Breakdown by dimension
  breakdown: {
    openness: Number,
    conscientiousness: Number,
    extraversion: Number,
    agreeableness: Number,
    neuroticism: Number
  },

  // Detailed analysis
  strengthAreas: [String],
  challengeAreas: [String],
  complementaryTraits: [mongoose.Schema.Types.Mixed],
  potentialConflicts: [String],

  // Interpretation
  interpretation: String,
  category: String,

  // Timestamps
  calculatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000) } // 30 days
});

// Index for faster queries
compatibilitySchema.index({ user1Id: 1, user2Id: 1 }, { unique: true });
compatibilitySchema.index({ compatibility: -1 });

module.exports = mongoose.model('CompatibilityCache', compatibilitySchema);