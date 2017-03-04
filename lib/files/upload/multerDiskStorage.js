'use strict';

const config = require('config');
const digestStream = require('digest-stream');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');

const DIGEST_ALGORITHM = config.get('b2.digest.algorithm');

function DiskStorage(opts) {
  this.destination = opts.destination;

  mkdirp.sync(opts.destination);
}

DiskStorage.prototype._handleFile = function _handleFile(req, file, cb) {
  const { destination } = this;
  const filename = req.id;

  const filePath = path.resolve(destination, filename);
  const outStream = fs.createWriteStream(filePath);
  let digest;
  let digestDataLength;

  const dstream = digestStream(DIGEST_ALGORITHM, 'hex', function (resultDigest, length) {
    digest = resultDigest;
    digestDataLength = length;
  });

  file.stream
      .pipe(dstream)
      .pipe(outStream);

  outStream.on('error', cb);

  outStream.on('finish', function () {
    cb(null, {
      destination,
      digest,
      digestAlgorithm: DIGEST_ALGORITHM,
      digestDataLength,
      filename,
      path: filePath,
      size: outStream.bytesWritten,
    });
  });
};

DiskStorage.prototype._removeFile = function _removeFile(req, file, cb) {
  const filePath = file.path;

  delete file.destination;
  delete file.filename;
  delete file.path;

  fs.unlink(filePath, cb);
};

module.exports = function (opts) {
  return new DiskStorage(opts);
};
