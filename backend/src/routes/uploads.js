const router = require("express").Router();
const { randomUUID } = require("crypto");
const { createUploadUrl } = require("../lib/s3");
const { protect } = require("../../middleware/auth");

router.post("/uploads/presign", protect, async (req, res) => {
  try {
    const { contentType } = req.body;

    if (!contentType) {
      return res.status(400).json({ error: "contentType is required" });
    }

    const key = `uploads/${Date.now()}-${randomUUID()}`;


    const url = await createUploadUrl({
      key,
      contentType
    });

    res.json({ key, url });
  } catch (err) {
    console.error("presign error", err);
    res.status(500).json({ error: "failed to create upload url" });
  }
});

module.exports = router;
