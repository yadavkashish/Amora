const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});
const upload = multer({ storage });

/**
 * POST /api/profile/create
 * Create a profile for the logged-in user
 */
/**
 * POST /api/profile/create
 * Create a profile for the logged-in user
 */
router.post(
  "/create",
  protect,
  upload.fields([{ name: "profilePic" }, { name: "morePics" }]),
  async (req, res) => {
    try {
      // ✅ Normalize interests
      let interests = req.body.interests || req.body["interests[]"] || [];
      if (!Array.isArray(interests)) interests = [interests];
      interests = interests.filter((i) => i && i.trim().length > 0);

      // ✅ Create profile object
      const profile = new Profile({
        user: req.user._id, // attach logged-in user
        name: req.body.name,
        age: req.body.age,
        gender: req.body.gender,
        bio: req.body.bio,
        branch: req.body.branch,
        course: req.body.course,
        year: req.body.year,
        preference: req.body.preference,
        location: req.body.location,
        interests,
        profilePic: req.files["profilePic"]
          ? req.files["profilePic"][0].filename
          : null,
        morePics: req.files["morePics"]
          ? req.files["morePics"].map((f) => f.filename)
          : [],
      });

      await profile.save();
      res.status(201).json({ success: true, profile });
    } catch (err) {
      console.error("❌ Profile creation error:", err);

      // Send detailed error info to frontend
      res.status(400).json({
        success: false,
        error: err.message,
        details: err.errors || null,
      });
    }
  }
);



/**
 * GET /api/profile/latest
 * Fetch the latest profile for the logged-in user
 */
router.get('/latest', protect, async (req, res) => {
  try {
    const latestProfile = await Profile.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    if (!latestProfile) {
      return res.status(404).json({ error: 'No profiles found for this user' });
    }
    res.json(latestProfile);
  } catch (error) {
    console.error('❌ Error fetching latest profile:', error);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

/**
 * GET /api/profile/all
 * Fetch all profiles for the logged-in user
 */
router.get('/all', protect, async (req, res) => {
  try {
    const profiles = await Profile.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(profiles);
  } catch (error) {
    console.error('❌ Error fetching user profiles:', error);
    res.status(500).json({ error: 'Failed to fetch user profiles' });
  }
});
/**
 * GET /api/profile/all-profiles
 * Fetch all profiles except the logged-in user
 */
// Get all profiles except logged-in user, with filters
router.get('/all-profiles', protect, async (req, res) => {
  try {
    const { gender, branch, course, year, interest } = req.query;
    const filter = { user: { $ne: req.user._id } };

    if (gender) filter.gender = gender;
    if (branch) filter.branch = branch;
    if (course) filter.course = course;
    if (year) filter.year = parseInt(year);
    if (interest) filter.interests = { $in: [interest] };

    const profiles = await Profile.find(filter)
      .select('name age gender branch course year bio preference profilePic morePics interests')
      .populate('user', 'email');

    res.status(200).json(profiles);
  } catch (error) {
    console.error('❌ Error fetching profiles:', error);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

// ✅ Put this ABOVE the '/:id' route
router.get('/user/:userId', protect, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId })
      .populate('user', 'name email profilePic');

    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    console.error('Error fetching other user profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Keep this BELOW
router.get('/:id', protect, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    console.error('❌ Error fetching profile:', error);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});


/**
 * PUT /api/profile/:id
 * Update a profile for the logged-in user
 */
router.put(
  '/:id',
  protect,
  upload.fields([
    { name: 'profilePic', maxCount: 1 },
    { name: 'morePics', maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const profile = await Profile.findById(req.params.id);
      if (!profile) return res.status(404).json({ error: 'Profile not found' });

      // Ownership check
      if (profile.user.toString() !== req.user._id.toString())
        return res.status(403).json({ error: 'Unauthorized' });

      // Text fields
      const { name, age, gender, bio, preference, location } = req.body;
      let interests = req.body['interests[]'] || req.body.interests;

      if (name) profile.name = name;
      if (age) profile.age = age;
      if (gender) profile.gender = gender;
      if (bio) profile.bio = bio;
      if (preference) profile.preference = preference;
      if (location) profile.location = location;

      if (interests) {
        if (typeof interests === 'string') {
          // Parse JSON or comma-separated
          try {
            interests = JSON.parse(interests);
          } catch {
            interests = interests.split(',').map(i => i.trim());
          }
        }
        profile.interests = Array.isArray(interests) ? interests : [interests];
      }

      // Profile picture replacement
      if (req.files.profilePic) {
        if (profile.profilePic && fs.existsSync(path.join(uploadDir, profile.profilePic))) {
          fs.unlinkSync(path.join(uploadDir, profile.profilePic));
        }
        profile.profilePic = req.files.profilePic[0].filename;
      }

      // Handle morePics
      let existingPics = req.body['existingMorePics[]'] || req.body.existingMorePics || [];
      if (!Array.isArray(existingPics)) existingPics = [existingPics];

      // Delete removed pics
      profile.morePics.forEach(pic => {
        if (!existingPics.includes(pic) && fs.existsSync(path.join(uploadDir, pic))) {
          fs.unlinkSync(path.join(uploadDir, pic));
        }
      });

      // Append new uploads
      const uploadedPics = req.files.morePics ? req.files.morePics.map(f => f.filename) : [];
      profile.morePics = [...existingPics, ...uploadedPics];

      await profile.save();
      res.status(200).json(profile);
    } catch (err) {
      console.error('Error updating profile:', err);
      res.status(500).json({ error: 'Server error updating profile' });
    }
  }
);





module.exports = router;
