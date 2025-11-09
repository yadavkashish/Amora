const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Basic details
    name: { type: String, required: true, trim: true },
    age: { type: Number, min: 16, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    bio: { type: String, maxlength: 500 },

    // College-specific
    branch: { type: String, required: true },
    course: { type: String, required: true },
    year: { type: Number, enum: [1, 2, 3, 4], required: true },

    // Preferences
    preference: { type: String, enum: ["Male", "Female", "Other", "Any"], default: "Any" },
    interests: [{ type: String }],

    // Location
    location: { type: String },

    // Profile Picture
    profilePic: { type: String, default: "" },
    profilePicPublicId: { type: String, default: "" },

    // More Pictures (Gallery)
    morePics: [{ type: String }],
    morePicsPublicIds: [{ type: String }],

    // Cover Image (NEW)
    coverImage: { type: String, default: "" },
    coverImagePublicId: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
