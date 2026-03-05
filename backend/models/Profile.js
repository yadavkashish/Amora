const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    name: { type: String, required: true, trim: true },
    age: { type: Number, min: 16, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    bio: { type: String, maxlength: 500 },

    course: { type: String, required: true },
    
    // ✅ Updated: Removed the 1-4 enum and set it to accept full pass-out years
    year: { 
      type: Number, 
      required: true,
      min: 1950, 
      max: 2100 
    },

    preference: { type: String, enum: ["Male", "Female", "Other", "Any"], default: "Any" },
    interests: [{ type: String }],

    profilePic: { type: String, default: "" },
    profilePicPublicId: { type: String, default: "" },

    morePics: [{ type: String }],
    morePicsPublicIds: [{ type: String }],

    coverImage: { type: String, default: "" },
    coverImagePublicId: { type: String, default: "" },

    location: {
      city: { type: String },
    },

    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [0, 0],
      },
    },
  },
  { timestamps: true }
);

// ⭐ CORRECT GEO INDEX
profileSchema.index({
  currentLocation: "2dsphere",
});

module.exports = mongoose.model("Profile", profileSchema);