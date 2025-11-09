// routes/profile.js
const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { protect } = require("../middleware/auth");

// Use memory storage so we can stream buffer to Cloudinary
const upload = multer({ storage: multer.memoryStorage() });

// Tolerant import for your helper util
const uploadUtil = require("../utils/uploadToCloudinary");
const uploadBuffer =
  uploadUtil.uploadBuffer ||
  uploadUtil.uploadToCloudinary ||
  uploadUtil.default ||
  uploadUtil;

// Helper that tries common call signatures for uploadBuffer
async function callUploadBuffer(buffer, folder) {
  try {
    return await uploadBuffer(buffer, { folder });
  } catch (err) {
    try {
      return await uploadBuffer(buffer, folder);
    } catch (err2) {
      throw err;
    }
  }
}

/** POST /api/profile/create
 *  Creates a profile and uploads files to Cloudinary
 */
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
      // Normalize interests
      let interests = req.body.interests || req.body["interests[]"] || [];
      if (!Array.isArray(interests)) interests = [interests];
      interests = interests.filter((i) => i && i.trim().length > 0);

      // Upload profilePic if provided
      let profilePic = null;
      let profilePicPublicId = null;
      if (req.files?.profilePic?.[0]) {
        const result = await callUploadBuffer(
          req.files.profilePic[0].buffer,
          "amora/profilePics"
        );
        profilePic = result.secure_url || result.url;
        profilePicPublicId = result.public_id || result.publicId || null;
      }

      // Upload morePics if provided (parallel)
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

      // Upload coverImage if provided
      let coverImage = null;
      let coverImagePublicId = null;
      if (req.files?.coverImage?.[0]) {
        const result = await callUploadBuffer(
          req.files.coverImage[0].buffer,
          "amora/covers"
        );
        coverImage = result.secure_url || result.url;
        coverImagePublicId = result.public_id || result.publicId || null;
      }

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
      res.status(201).json({ success: true, profile });
    } catch (err) {
      console.error("❌ Profile creation error:", err);
      res.status(400).json({ success: false, error: err.message });
    }
  }
);

/** GET latest profile for logged-in user */
router.get("/latest", protect, async (req, res) => {
  try {
    const latestProfile = await Profile.findOne({ user: req.user._id }).sort({
      createdAt: -1,
    });
    if (!latestProfile)
      return res.status(404).json({ error: "No profiles found for this user" });
    res.json(latestProfile);
  } catch (error) {
    console.error("❌ Error fetching latest profile:", error);
    res.status(500).json({ error: "Server error fetching profile" });
  }
});

/** GET all profiles of current user */
router.get("/all", protect, async (req, res) => {
  try {
    const profiles = await Profile.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json(profiles);
  } catch (error) {
    console.error("❌ Error fetching user profiles:", error);
    res.status(500).json({ error: "Failed to fetch user profiles" });
  }
});

/** POST /api/profile/:id/photos
 *  Append morePics (uploads) to an existing profile
 */
router.post(
  "/:id/photos",
  protect,
  upload.array("morePics", 10),
  async (req, res) => {
    try {
      const profile = await Profile.findById(req.params.id);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      if (profile.user.toString() !== req.user._id.toString())
        return res.status(403).json({ error: "Unauthorized" });

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No files provided" });
      }

      const uploads = await Promise.all(
        req.files.map((f) => callUploadBuffer(f.buffer, "amora/morePics"))
      );

      uploads.forEach((u) => {
        profile.morePics.push(u.secure_url || u.url);
        profile.morePicsPublicIds.push(u.public_id || u.publicId || null);
      });

      await profile.save();
      res.status(200).json({ success: true, profile });
    } catch (err) {
      console.error("❌ Error uploading photos:", err);
      res.status(500).json({ error: err.message || "Failed to upload photos" });
    }
  }
);

/** PUT /api/profile/:id/cover
 *  Upload or update cover image
 */
router.put(
  "/:id/cover",
  protect,
  upload.single("coverImage"),
  async (req, res) => {
    try {
      const profile = await Profile.findById(req.params.id);
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      if (profile.user.toString() !== req.user._id.toString())
        return res.status(403).json({ error: "Unauthorized" });

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Delete old cover from Cloudinary if exists
      if (profile.coverImagePublicId) {
        try {
          await cloudinary.uploader.destroy(profile.coverImagePublicId);
        } catch (e) {
          console.warn("Failed to destroy old cover image:", e.message);
        }
      }

      // Upload new cover
      const up = await callUploadBuffer(req.file.buffer, "amora/covers");
      profile.coverImage = up.secure_url || up.url;
      profile.coverImagePublicId = up.public_id || up.publicId || null;

      await profile.save();
      res.status(200).json({ success: true, profile });
    } catch (err) {
      console.error("❌ Error uploading cover:", err);
      res
        .status(500)
        .json({ error: err.message || "Failed to upload cover image" });
    }
  }
);

/** GET all profiles except logged-in user (filters supported) */
router.get("/all-profiles", protect, async (req, res) => {
  try {
    const { gender, branch, course, year, interest } = req.query;
    const filter = { user: { $ne: req.user._id } };

    if (gender) filter.gender = gender;
    if (branch) filter.branch = branch;
    if (course) filter.course = course;
    if (year) filter.year = parseInt(year);
    if (interest) filter.interests = { $in: [interest] };

    const profiles = await Profile.find(filter)
      .select(
        "name age gender branch course year bio preference profilePic morePics interests coverImage"
      )
      .populate("user", "email");

    res.status(200).json(profiles);
  } catch (error) {
    console.error("❌ Error fetching profiles:", error);
    res.status(500).json({ error: "Failed to fetch profiles" });
  }
});

/** GET profile by user id */
router.get("/user/:userId", protect, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId }).populate(
      "user",
      "name email profilePic"
    );
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile);
  } catch (err) {
    console.error("Error fetching other user profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/** GET profile by profile id */
router.get("/:id", protect, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile);
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    res.status(500).json({ error: "Server error fetching profile" });
  }
});

/** PUT /api/profile/:id
 *  Update all profile fields + handle cover image, profilePic, and morePics
 */
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
      if (!profile) return res.status(404).json({ error: "Profile not found" });
      if (profile.user.toString() !== req.user._id.toString())
        return res.status(403).json({ error: "Unauthorized" });

      // Update simple fields
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

      // ========== COVER IMAGE HANDLING ==========
      if (req.files?.coverImage?.[0]) {
        if (profile.coverImagePublicId) {
          try {
            await cloudinary.uploader.destroy(profile.coverImagePublicId);
          } catch (delErr) {
            console.warn(
              "⚠️ Failed to destroy old coverImage on Cloudinary:",
              delErr.message
            );
          }
        }
        const up = await callUploadBuffer(
          req.files.coverImage[0].buffer,
          "amora/covers"
        );
        profile.coverImage = up.secure_url || up.url;
        profile.coverImagePublicId = up.public_id || up.publicId || null;
      }

      // ========== PROFILE PIC HANDLING ==========
      if (req.files?.profilePic?.[0]) {
        if (profile.profilePicPublicId) {
          try {
            await cloudinary.uploader.destroy(profile.profilePicPublicId);
          } catch (delErr) {
            console.warn(
              "⚠️ Failed to destroy old profilePic on Cloudinary:",
              delErr.message
            );
          }
        }
        const up = await callUploadBuffer(
          req.files.profilePic[0].buffer,
          "amora/profilePics"
        );
        profile.profilePic = up.secure_url || up.url;
        profile.profilePicPublicId = up.public_id || up.publicId || null;
      }

      // ========== MORE PICS HANDLING ==========
      let existingPics =
        req.body["existingMorePics[]"] || req.body.existingMorePics || [];
      if (!Array.isArray(existingPics))
        existingPics = existingPics ? [existingPics] : [];

      // Delete removed pics from Cloudinary
      const keepUrls = new Set(existingPics);
      const urlsToKeep = [];
      const publicIdsToKeep = [];
      for (let i = 0; i < (profile.morePics || []).length; i++) {
        const url = profile.morePics[i];
        const pubId =
          (profile.morePicsPublicIds && profile.morePicsPublicIds[i]) || null;
        if (keepUrls.has(url)) {
          urlsToKeep.push(url);
          publicIdsToKeep.push(pubId);
        } else {
          if (pubId) {
            try {
              await cloudinary.uploader.destroy(pubId);
            } catch (err) {
              console.warn(
                "⚠️ Failed to destroy morePic on Cloudinary:",
                err.message
              );
            }
          }
        }
      }
      profile.morePics = urlsToKeep;
      profile.morePicsPublicIds = publicIdsToKeep;

      // Append newly uploaded morePics
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
      res.status(200).json(profile);
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      res.status(500).json({ error: err.message || "Server error updating profile" });
    }
  }
);

module.exports = router;
