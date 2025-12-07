// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: null,
    },

    // Extracted email domain for filtering (e.g., "@college.edu")
    emailDomain: {
      type: String,
      required: true,
    },

    // encrypted signup selfie descriptor (AES-GCM object: { iv, tag, data })
    signupSelfieEncrypted: { type: Object, default: null },

    // encrypted descriptor of the latest VERIFIED profile picture
    profileDescriptorEncrypted: { type: Object, default: null },

    // set true when profile photo matches signup selfie / verified profile photo
    profileVerified: { type: Boolean, default: false },

    // optional: profile picture url stored at Profile model but also can be in user
    profilePicURL: { type: String, default: null },
  },
  { timestamps: true }
);

// Extract domain before saving and hash password
userSchema.pre("save", async function (next) {
  try {
    // Extract domain from email if email is modified or new
    if (this.isModified("email") || this.isNew) {
      const domain = this.email.substring(this.email.lastIndexOf("@"));
      this.emailDomain = domain.toLowerCase();
    }

    // Hash password if modified
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
    }

    next();
  } catch (err) {
    next(err);
  }
});

// Compare password helper
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
