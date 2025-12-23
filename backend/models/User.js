const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String, required: true },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: null,
    },

    // derived automatically
    emailDomain: {
      type: String,
      required: true,
      index: true,
    },

    signupSelfieEncrypted: { type: Object, default: null },
    profileDescriptorEncrypted: { type: Object, default: null },
    profileVerified: { type: Boolean, default: false },
    profilePicURL: { type: String, default: null },
    blockedUsers: [
  { type: mongoose.Schema.Types.ObjectId, ref: "User" }
],

  },
  { timestamps: true }
);

/**
 * ✅ Extract email domain BEFORE validation
 */
userSchema.pre("validate", function (next) {
  if (this.email && !this.emailDomain) {
    this.emailDomain = this.email.split("@")[1].toLowerCase();
  }
  next();
});

/**
 * ✅ Hash password BEFORE save
 */
userSchema.pre("save", async function (next) {
  try {
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
