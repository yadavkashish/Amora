const express = require('express');
const router = express.Router();
const FormResponse = require('../models/FormResponse');
const Profile = require('../models/Profile');
const { protect } = require('../middleware/auth');

// 📝 POST /api/form - Save form response (protected)
router.post('/', protect, async (req, res) => {
  try {
    const formData = req.body;
    const userId = req.user.userId; // ✅ from protect middleware

    const formResponse = new FormResponse({
      ...formData,
      user: userId // ✅ matches schema field name
    });

    await formResponse.save();
    res.status(201).json({ message: 'Form submitted successfully' });
  } catch (err) {
    console.error('❌ Error saving form:', err);
    res.status(500).json({ error: 'Server error submitting form' });
  }
});

// 1️⃣ GET /api/form/my-response - Logged-in user's form data
router.get('/my-response', protect, async (req, res) => {
  try {
    const form = await FormResponse.findOne({ user: req.user.userId });
    if (!form) {
      return res.status(404).json({ error: 'Form response not found' });
    }
    res.json(form);
  } catch (err) {
    console.error('❌ Error fetching my form response:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2️⃣ GET /api/form/all-with-profiles - Other users' forms + profiles
router.get('/all-with-profiles', protect, async (req, res) => {
  try {
    const forms = await FormResponse.find({ user: { $ne: req.user.userId } }).lean();

    const results = await Promise.all(
      forms.map(async (form) => {
        const profile = await Profile.findOne({ user: form.user }).lean();
        return {
          formResponse: form,
          profile
        };
      })
    );

    res.json(results);
  } catch (err) {
    console.error('❌ Error fetching all form responses with profiles:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
