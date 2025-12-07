// utils/cryptoUtil.js
const crypto = require("crypto");
const MASTER_KEY = process.env.MASTER_KEY || "";

if (!MASTER_KEY || MASTER_KEY.length < 32) {
  console.warn("MASTER_KEY not set or too short. Set a secure 32 byte env var.");
}

// AES-256-GCM encrypt/decrypt
function encryptDescriptor(descriptor) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(MASTER_KEY, "utf8").slice(0, 32), iv);
  const plaintext = JSON.stringify(descriptor);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { iv: iv.toString("hex"), tag: tag.toString("hex"), data: enc.toString("hex") };
}

function decryptDescriptor(obj) {
  const iv = Buffer.from(obj.iv, "hex");
  const tag = Buffer.from(obj.tag, "hex");
  const enc = Buffer.from(obj.data, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", Buffer.from(MASTER_KEY, "utf8").slice(0, 32), iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  return JSON.parse(dec.toString("utf8"));
}

module.exports = { encryptDescriptor, decryptDescriptor };
