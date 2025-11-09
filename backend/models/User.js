const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: null,
  },
  
  // ✅ NEW FIELD: Extracted email domain for filtering
  emailDomain: {
    type: String,
    required: true,
  },
}, { timestamps: true });

// ✅ Extract domain before saving
userSchema.pre('save', async function (next) {
  try {
    // Extract domain from email if email is modified or new
    if (this.isModified('email') || this.isNew) {
      const domain = this.email.substring(this.email.lastIndexOf('@'));
      this.emailDomain = domain.toLowerCase(); // e.g., "@gmail.com" or "@kiet.edu"
    }

    // Hash password if modified
    if (this.isModified('password')) {
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

module.exports = mongoose.model('User', userSchema);
