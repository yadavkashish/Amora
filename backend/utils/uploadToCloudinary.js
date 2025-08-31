const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

exports.uploadBuffer = (buffer, { folder = 'amora/uploads' } = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

exports.destroyById = (publicId) =>
  cloudinary.uploader.destroy(publicId); // returns a promise
