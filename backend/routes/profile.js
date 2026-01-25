// routes/profile.js
const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { protect } = require("../middleware/auth");

// added for descriptor saving
const User = require("../models/User");
const { encryptDescriptor } = require("../utils/cryptoUtil");

// Use memory storage for Cloudinary buffer uploads
const upload = multer({ storage: multer.memoryStorage() });

// tolerant cloudinary upload util
const uploadUtil = require("../utils/uploadToCloudinary");
const uploadBuffer =
  uploadUtil.uploadBuffer ||
  uploadUtil.uploadToCloudinary ||
  uploadUtil.default ||
  uploadUtil;

async function callUploadBuffer(buffer, folder) {
  try {
    return await uploadBuffer(buffer, { folder });
  } catch (e1) {
    try {
      return await uploadBuffer(buffer, folder);
    } catch (e2) {
      throw e1;
    }
  }
}

/* =======================================================
   POST /api/profile/create
   Creates profile + uploads files + stores descriptor
   ======================================================= */
router.post(
  "/create",
  protect,
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "morePics" },
    { name: "coverImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // Handle interests
      let interests = req.body.interests || req.body["interests[]"] || [];
      if (!Array.isArray(interests)) interests = [interests];
      interests = interests.filter((i) => i?.trim().length > 0);

      // Upload profile picture
      let profilePic = null;
      let profilePicPublicId = null;
      if (req.files?.profilePic?.[0]) {
        const up = await callUploadBuffer(
          req.files.profilePic[0].buffer,
          "amora/profilePics"
        );
        profilePic = up.secure_url || up.url;
        profilePicPublicId = up.public_id || up.publicId || null;
      }

      // Upload optional more pictures
      let morePics = [];
      let morePicsPublicIds = [];
      if (req.files?.morePics?.length) {
        const uploads = await Promise.all(
          req.files.morePics.map((f) =>
            callUploadBuffer(f.buffer, "amora/morePics")
          )
        );
        uploads.forEach((u) => {
          morePics.push(u.secure_url || u.url);
          morePicsPublicIds.push(u.public_id || u.publicId || null);
        });
      }

      // Upload cover image
      let coverImage = null;
      let coverImagePublicId = null;
      if (req.files?.coverImage?.length) {
        const up = await callUploadBuffer(
          req.files.coverImage[0].buffer,
          "amora/covers"
        );
        coverImage = up.secure_url || up.url;
        coverImagePublicId = up.public_id || up.publicId || null;
      }

      /* -------------------------------------------
         SAVE NEW PROFILE TO DB
         ------------------------------------------- */
      const profile = new Profile({
        user: req.user._id,
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
        profilePic,
        profilePicPublicId,
        morePics,
        morePicsPublicIds,
        coverImage,
        coverImagePublicId,
      });

      await profile.save();

      /* -------------------------------------------
         SAVE VERIFIED FACE DESCRIPTOR TO USER
         (from profileDescriptor in request)
         ------------------------------------------- */
      if (req.body.profileDescriptor) {
        try {
          const parsed =
            typeof req.body.profileDescriptor === "string"
              ? JSON.parse(req.body.profileDescriptor)
              : req.body.profileDescriptor;

          if (Array.isArray(parsed) && parsed.length > 0) {
            const enc = encryptDescriptor(parsed);

            await User.findByIdAndUpdate(req.user._id, {
              profileDescriptorEncrypted: enc,
              profileVerified: true,
            });
          }
        } catch (err) {
          console.warn("⚠️ Failed to save verified descriptor:", err.message);
        }
      }

      return res.status(201).json({ success: true, profile });
    } catch (err) {
      console.error("❌ Profile creation error:", err);
      res.status(400).json({ success: false, error: err.message });
    }
  }
);

/* =======================================================
   GET latest profile (logged-in user)
   ======================================================= */
router.get("/latest", protect, async (req, res) => {
  try {
    const latestProfile = await Profile.findOne({ user: req.user._id }).sort({
      createdAt: -1,
    });
    if (!latestProfile)
      return res.status(404).json({ error: "No profiles found" });

    res.json(latestProfile);
  } catch (error) {
    res.status(500).json({ error: "Server error fetching profile" });
  }
});

/* =======================================================
   GET all profiles of logged-in user
   ======================================================= */
router.get("/all", protect, async (req, res) => {
  try {
    const profiles = await Profile.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(profiles);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profiles" });
  }
});

/* =======================================================
   POST /:id/photos — Add more photos
   ======================================================= */
router.post(
  "/:id/photos",
  protect,
  upload.array("morePics", 10),
  async (req, res) => {
    try {
      const profile = await Profile.findById(req.params.id);
      if (!profile)
        return res.status(404).json({ error: "Profile not found" });

      if (profile.user.toString() !== req.user._id.toString())
        return res.status(403).json({ error: "Unauthorized" });

      if (!req.files?.length)
        return res.status(400).json({ error: "No files provided" });

      const uploads = await Promise.all(
        req.files.map((f) => callUploadBuffer(f.buffer, "amora/morePics"))
      );

      uploads.forEach((u) => {
        profile.morePics.push(u.secure_url || u.url);
        profile.morePicsPublicIds.push(u.public_id || u.publicId || null);
      });

      await profile.save();
      res.json({ success: true, profile });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* =======================================================
   PUT /:id/cover — Update cover photo
   ======================================================= */
router.put(
  "/:id/cover",
  protect,
  upload.single("coverImage"),
  async (req, res) => {
    try {
      const profile = await Profile.findById(req.params.id);
      if (!profile)
        return res.status(404).json({ error: "Profile not found" });

      if (profile.user.toString() !== req.user._id.toString())
        return res.status(403).json({ error: "Unauthorized" });

      if (!req.file)
        return res.status(400).json({ error: "No file uploaded" });

      if (profile.coverImagePublicId) {
        try {
          await cloudinary.uploader.destroy(profile.coverImagePublicId);
        } catch (e) {}
      }

      const up = await callUploadBuffer(
        req.file.buffer,
        "amora/covers"
      );

      profile.coverImage = up.secure_url || up.url;
      profile.coverImagePublicId = up.public_id || up.publicId || null;

      await profile.save();
      res.json({ success: true, profile });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/* =======================================================
   GET /all-profiles — Everyone except current user
   ======================================================= */
router.get("/all-profiles", protect, async (req, res) => {
  try {
    const me = await User.findById(req.user._id);
    if (!me) return res.status(404).json({ error: "User not found" });

    const filter = { user: { $ne: req.user._id } };

    // ---- PRIVACY LOGIC ----
    if (me.privacy === "private") {
      // Private users: ONLY same-domain students
      filter.emailDomain = me.emailDomain;
    } else {
      // Public users: Gmail + same domain only
      filter.$or = [
        { emailDomain: "gmail.com" },
        { emailDomain: me.emailDomain }
      ];
    }

    // Additional UI-based filters (gender, year, etc)
    const { gender, branch, course, year, interest } = req.query;

    if (gender) filter.gender = gender;
    if (branch) filter.branch = branch;
    if (course) filter.course = course;
    if (year) filter.year = parseInt(year);
    if (interest) filter.interests = { $in: [interest] };

    const profiles = await Profile.find(filter)
      .select("name age gender branch course year bio preference profilePic morePics interests coverImage")
      .populate("user", "email emailDomain privacy");

    res.json(profiles);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch profiles" });
  }
});

router.put("/privacy", protect, async (req, res) => {
  try {
    const { privacy } = req.body;
    if (!["public", "private"].includes(privacy))
      return res.status(400).json({ error: "Invalid privacy value" });

    await User.findByIdAndUpdate(req.user._id, { privacy });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update privacy" });
  }
});


/* =======================================================
   GET profile by userId
   ======================================================= */
router.get("/user/:userId", protect, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.userId,
    }).populate("user", "name email profilePic");

    if (!profile) return res.status(404).json({ error: "Not found" });

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

/* =======================================================
   GET profile by id
   ======================================================= */
router.get("/:id", protect, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile)
      return res.status(404).json({ error: "Profile not found" });

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "Server error fetching profile" });
  }
});

/* =======================================================
   PUT /:id — Update profile + Save Descriptor
   ======================================================= */
router.put(
  "/:id",
  protect,
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "morePics", maxCount: 10 },
    { name: "coverImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const profile = await Profile.findById(req.params.id);
      if (!profile)
        return res.status(404).json({ error: "Profile not found" });

      if (profile.user.toString() !== req.user._id.toString())
        return res.status(403).json({ error: "Unauthorized" });

      // Update text fields
      const fields = [
        "name",
        "age",
        "gender",
        "bio",
        "preference",
        "location",
        "branch",
        "course",
        "year",
      ];

      fields.forEach((f) => {
        if (req.body[f] != null) profile[f] = req.body[f];
      });

      // Parse interests
      let interests = req.body["interests[]"] || req.body.interests;
      if (interests) {
        if (typeof interests === "string") {
          try {
            interests = JSON.parse(interests);
          } catch {
            interests = interests.split(",").map((s) => s.trim());
          }
        }
        profile.interests = Array.isArray(interests) ? interests : [interests];
      }

      // Cover image update
      if (req.files?.coverImage?.[0]) {
        if (profile.coverImagePublicId)
          try {
            await cloudinary.uploader.destroy(profile.coverImagePublicId);
          } catch (err) {}

        const up = await callUploadBuffer(
          req.files.coverImage[0].buffer,
          "amora/covers"
        );
        profile.coverImage = up.secure_url || up.url;
        profile.coverImagePublicId = up.public_id || up.publicId || null;
      }

      // Profile pic update
      if (req.files?.profilePic?.[0]) {
        if (profile.profilePicPublicId)
          try {
            await cloudinary.uploader.destroy(profile.profilePicPublicId);
          } catch (err) {}

        const up = await callUploadBuffer(
          req.files.profilePic[0].buffer,
          "amora/profilePics"
        );

        profile.profilePic = up.secure_url || up.url;
        profile.profilePicPublicId = up.public_id || up.publicId || null;
      }

      // More pics update
      let existingPics =
        req.body["existingMorePics[]"] || req.body.existingMorePics || [];
      if (!Array.isArray(existingPics))
        existingPics = existingPics ? [existingPics] : [];

      const keepSet = new Set(existingPics);
      const keptUrls = [];
      const keptIds = [];

      for (let i = 0; i < profile.morePics.length; i++) {
        const url = profile.morePics[i];
        const id = profile.morePicsPublicIds[i];

        if (keepSet.has(url)) {
          keptUrls.push(url);
          keptIds.push(id);
        } else if (id) {
          try {
            await cloudinary.uploader.destroy(id);
          } catch (err) {}
        }
      }

      profile.morePics = keptUrls;
      profile.morePicsPublicIds = keptIds;

      if (req.files?.morePics?.length) {
        const uploads = await Promise.all(
          req.files.morePics.map((f) =>
            callUploadBuffer(f.buffer, "amora/morePics")
          )
        );

        uploads.forEach((u) => {
          profile.morePics.push(u.secure_url || u.url);
          profile.morePicsPublicIds.push(u.public_id || u.publicId || null);
        });
      }

      await profile.save();

      /* ------------------------------------------------------
         Save verified descriptor when updating profile photo
         ------------------------------------------------------ */
      if (req.body.profileDescriptor) {
        try {
          const parsed =
            typeof req.body.profileDescriptor === "string"
              ? JSON.parse(req.body.profileDescriptor)
              : req.body.profileDescriptor;

          if (Array.isArray(parsed) && parsed.length > 0) {
            const enc = encryptDescriptor(parsed);

            await User.findByIdAndUpdate(req.user._id, {
              profileDescriptorEncrypted: enc,
              profileVerified: true,
            });
          }
        } catch (err) {
          console.warn("⚠️ Failed saving new descriptor:", err.message);
        }
      }

      res.json(profile);
    } catch (err) {
      res.status(500).json({ error: err.message || "Server error updating profile" });
    }
  }
);

module.exports = router;
