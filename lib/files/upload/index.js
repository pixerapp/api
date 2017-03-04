'use strict';

const config = require('config');

const upload = (function () {
  // This is a middleware to handle uploading files.
  const upload = require('multer')({
    storage: require('./multerDiskStorage')({
      destination: config.get('upload.tempDir'),
    }),
    fileFilter,
    // `file` is the field name which should be used
    // to upload a file. We accept a single file.
  }).single('file');

  return function (req, res, next) {
    req.timers.uploadStartTime = new Date;

    upload(req, res, function (err) {
      req.timers.uploadEndTime = new Date;
      req.timers.timeToUpload = req.timers.uploadStartTime - req.timers.requestStartTime;
      req.timers.uploadDuration = req.timers.uploadEndTime - req.timers.uploadStartTime;

      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next({
            status: 400,
            message: `The file size exceeded the maximum size permitted (Max: ${config.get('upload.maxFileSize')} bytes).`
          });
        }
      }

      next(err);
    });
  };
})();

function fileFilter(req, file, cb) {
  // `fileFilter()` should call `cb` with a boolean
  // to indicate if the file should be accepted

  if (!config.get('upload.supportedMimeTypes').includes(file.mimetype)) {
    return cb({
      status: 400,
      error: `Unsupported file type "${file.mimetype}" has been uploaded.`
    });
  }

  // To accept the file pass `true`, like so:
  cb(null, true);
}

function verifyFile(req, res, next) {
  if (!req.file) {
    return next({
      status: 400,
      error: 'Missing required `file` payload.'
    });
  }

  req.log.info(req.file, 'file');

  next();
}

module.exports = [
  upload,
  verifyFile,
];
