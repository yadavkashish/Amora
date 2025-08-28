// models/Profile.js
const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Basic details
    name: { type: String, required: true, trim: true },
    age: { type: Number, min: 16, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    bio: { type: String, maxlength: 500 },

    // College-specific
    branch: { type: String, required: true },   // e.g., CS, IT, ECE
    course: { type: String, required: true },   // e.g., B.Tech, MBA
    year: { type: Number, enum: [1, 2, 3, 4], required: true },

    // Preferences
    preference: { type: String, enum: ['Male', 'Female', 'Other', 'Any'], default: 'Any' },
    interests: [{ type: String }],

    // Location (optional, since within campus)
    location: { type: String },

    // Media
    profilePic: { type: String, default: '' },
    morePics: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
