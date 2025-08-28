const mongoose = require('mongoose');

const formResponseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hobbies: [{ type: String }],

  // Positive Traits
  patience: String,
  empathy: String,
  honesty: String,
  loyalty: String,

  // Negative Traits
  angerIssues: String,
  jealousy: String,
  selfishness: String,

  // Lifestyle
  timePersonality: String,
  fitnessImportance: String,
  movingOpenness: String,

  // Relationship Style
  conflictStyle: String,
  aloneTime: String,
  kidsPreference: String,

  // Partner Preferences
  partnerPatienceImportance: String,
  partnerHonestyImportance: String,
  partnerEmpathyImportance: String,
}, { timestamps: true });

module.exports = mongoose.model('FormResponse', formResponseSchema);
