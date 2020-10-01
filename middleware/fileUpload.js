const multer = require('multer');
const path = require('path');
const fs = require('fs');

exports.uploadSingleFile = (req, res) => {
  const storageWithDestination = multer.diskStorage({
    destination: function (req, file, callback) {
      const postPath = `./uploads/media`;
      if (!fs.existsSync(postPath)) {
        fs.mkdirSync(postPath, { recursive: true });
      }
      callback(null, postPath);
    },
    filename: function (req, file, callback) {
      var fileName =
        'user_post_' + Date.now() + path.parse(file.originalname).ext;
      callback(null, fileName);
    },
  });
  return multer({
    storage: storageWithDestination,
  }).fields([
    {
      name: 'video',
      maxCount: 1,
    },
    {
      name: 'image',
      maxCount: 1,
    },
  ]);
};