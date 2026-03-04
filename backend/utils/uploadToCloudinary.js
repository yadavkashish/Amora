const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

/*
  Upload buffer to cloudinary
  Used with multer memoryStorage
*/

exports.uploadBuffer = (
  buffer,
  {
    folder = "amora/uploads",
    width = 1080,
    quality = "auto",
    format = "webp",
  } = {}
) => {
  return new Promise((resolve, reject) => {
    try {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",

          // production optimizations
          transformation: [
            { width, crop: "limit" }, // resize large images
            { quality }, // auto compression
            { fetch_format: format }, // convert to webp
          ],
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return reject(error);
          }

          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
          });
        }
      );

      streamifier.createReadStream(buffer).pipe(stream);
    } catch (err) {
      reject(err);
    }
  });
};

/*
  Delete image
*/

exports.destroyById = async (publicId) => {
  try {
    if (!publicId) return;

    const result = await cloudinary.uploader.destroy(publicId);

    return result;
  } catch (err) {
    console.error("Cloudinary delete error:", err);
    throw err;
  }
};