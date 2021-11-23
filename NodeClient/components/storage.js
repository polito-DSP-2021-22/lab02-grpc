'use strict';

const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, './uploads');
    },
  filename: function (req, file, cb) {
      cb(null, file.originalname);
  }
});

const uploadImg = multer({storage: storage}).single('image');

module.exports.uploadImg = uploadImg;
