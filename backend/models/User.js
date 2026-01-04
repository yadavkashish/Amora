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

    emailDomain: {
      type: String,
      required: true,
      index: true,
    },

    // 🔐 SUBSCRIPTION
    isPremium: { type: Boolean, default: false },
    subscriptionType: {
      type: String,
      enum: ["monthly", "yearly", null],
      default: null,
    },
    subscriptionExpiry: { type: Date, default: null },

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

// extract domain
userSchema.pre("validate", function (next) {
  if (this.email && !this.emailDomain) {
    this.emailDomain = this.email.split("@")[1].toLowerCase();
  }
  next();
});

// hash password
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = function (pwd) {
  return bcrypt.compare(pwd, this.password);
};

module.exports = mongoose.model("User", userSchema);
