// routes/profile.js
const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { protect } = require("../middleware/auth");

const User = require("../models/User");
const { encryptDescriptor } = require("../utils/cryptoUtil");

// ---------------- MULTER CONFIG ----------------

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per image
  },
});

// ---------------- CLOUDINARY UTIL ----------------

const uploadUtil = require("../utils/uploadToCloudinary");

const uploadBuffer =
  uploadUtil.uploadBuffer ||
  uploadUtil.uploadToCloudinary ||
  uploadUtil.default ||
  uploadUtil;

async function callUploadBuffer(buffer, folder) {
  try {
    return await uploadBuffer(buffer, { folder });
  } catch (e) {
    console.error("Cloudinary upload failed:", e.message);
    throw e;
  }
}

// ---------------- HELPER ----------------

function parseInterests(req) {
  let interests = req.body.interests || req.body["interests[]"] || [];

  if (!Array.isArray(interests)) interests = [interests];

  return interests.filter((i) => i && i.trim().length > 0);
}

// =======================================================
// CREATE PROFILE
// =======================================================

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
      const interests = parseInterests(req);

      // ---------------- PROFILE PIC ----------------

      let profilePic = null;
      let profilePicPublicId = null;

      if (req.files?.profilePic?.[0]) {
        const up = await callUploadBuffer(
          req.files.profilePic[0].buffer,
          "amora/profilePics"
        );

        profilePic = up.secure_url || up.url;
        profilePicPublicId = up.public_id || null;
      }

      // ---------------- MORE PICS ----------------

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
          morePicsPublicIds.push(u.public_id || null);
        });
      }

      // ---------------- COVER IMAGE ----------------

      let coverImage = null;
      let coverImagePublicId = null;

      if (req.files?.coverImage?.[0]) {
        const up = await callUploadBuffer(
          req.files.coverImage[0].buffer,
          "amora/covers"
        );

        coverImage = up.secure_url || up.url;
        coverImagePublicId = up.public_id || null;
      }

      // ---------------- GEO LOCATION ----------------

      let currentLocation;

      const lat = Number(req.body.lat);
      const lng = Number(req.body.lng);

      if (!isNaN(lat) && !isNaN(lng)) {
        currentLocation = {
          type: "Point",
          coordinates: [lng, lat],
        };
      }

      // ---------------- SAVE PROFILE ----------------

      const profile = new Profile({
        user: req.user._id,
        name: req.body.name,
        age: req.body.age,
        gender: req.body.gender,
        bio: req.body.bio,
        course: req.body.course,
        year: req.body.year,
        preference: req.body.preference,
        location: { city: req.body.location || "" },

        currentLocation,

        interests,

        profilePic,
        profilePicPublicId,
        morePics,
        morePicsPublicIds,

        coverImage,
        coverImagePublicId,
      });

      await profile.save();

      // ---------------- SAVE FACE DESCRIPTOR ----------------

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
          console.warn("Descriptor save failed:", err.message);
        }
      }

      return res.status(201).json({
        success: true,
        profile,
      });
    } catch (err) {
      console.error("Profile creation error:", err);

      return res.status(500).json({
        success: false,
        error: err.message || "Failed creating profile",
      });
    }
  }
);

// =======================================================
// GET USER PROFILES
// =======================================================

router.get("/latest", protect, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id }).sort({
      createdAt: -1,
    });

    if (!profile)
      return res.status(404).json({ error: "No profiles found" });

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "Server error fetching profile" });
  }
});

router.get("/all", protect, async (req, res) => {
  try {
    const profiles = await Profile.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profiles" });
  }
});

// =======================================================
// ADD MORE PHOTOS
// =======================================================

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
        req.files.map((f) =>
          callUploadBuffer(f.buffer, "amora/morePics")
        )
      );

      uploads.forEach((u) => {
        profile.morePics.push(u.secure_url || u.url);
        profile.morePicsPublicIds.push(u.public_id || null);
      });

      await profile.save();

      res.json({ success: true, profile });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// =======================================================
// UPDATE LOCATION
// =======================================================

router.put("/update-location", protect, async (req, res) => {
  try {
    const { lat, lng } = req.body;

    await Profile.findOneAndUpdate(
      { user: req.user._id },
      {
        currentLocation: {
          type: "Point",
          coordinates: [lng, lat],
        },
      }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed updating location" });
  }
});

module.exports = router;