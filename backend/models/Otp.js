// models/Otp.js
const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  // store encrypted signup descriptor here temporarily until user verifies OTP
  signupSelfieEncrypted: { type: Object, default: null },
  createdAt: { type: Date, default: Date.now, expires: 60 * 10 } // auto-delete after 10 minutes
});

module.exports = mongoose.model('Otp', OtpSchema);
