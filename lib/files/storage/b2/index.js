'use strict';

const B2 = require('backblaze-b2');
const fs = require('fs');
const request = require('request');

function B2Storage(options) {
  this.options = options;
  this.client = new B2(options);
  this.urlPool = [];
}

module.exports = B2Storage;

B2Storage.prototype.init = function init() {
  if (this.client.authorizationToken) {
    return Promise.resolve();
  }

  return this.client.authorize();
};

B2Storage.prototype.removeFile = function removeFile(req, file) {
  if (!file) {
    return Promise.resolve();
  }

  return this.client.deleteFileVersion({
    fileId: file.id,
    fileName: file.filename
  });
};

B2Storage.prototype.uploadFile = function uploadFile(req, uploadURLInfo, file, buffer) {
  let postOptions = {
    uri: uploadURLInfo.uploadUrl,
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: uploadURLInfo.authorizationToken,
      'Content-Length': file.size,
      'Content-Type': file.mimetype || 'b2/x-auto',
      'X-Bz-File-Name': file.filename,
      'X-Bz-Content-Sha1': file.digest
    }
  };
  let { timers } = req;
  timers.uploadToCloudStartTime = new Date;

  return this.uploadStream(req, postOptions, buffer || file.path)
    .then(res => {
      timers.uploadToCloudDuration = new Date - timers.uploadToCloudStartTime;
      req.log.debug(res, 'uploadFile: response');

      if (res.statusCode === 200) {
        return res.body;
      }

      req.log.error(postOptions, `uploadFile: ${res.body.message}`);

      throw res.body.message;
    })
    .catch(err => {
      timers.uploadToCloudDuration = new Date - timers.uploadToCloudStartTime;

      throw err;
    });
};

B2Storage.prototype.uploadStream = function uploadStream(req, options, filePath) {
  return new Promise((resolve, reject) => {
    req.log.debug(options, 'uploadStream: options');

    function callback(err, response, body) {
      if (err) {
        req.log.error(options, `uploadStream: ${err.message}`);

        return reject(err);
      }

      resolve({
        body: JSON.parse(body),
        statusCode: response.statusCode,
      });
    }

    if (filePath instanceof Buffer) {
      options.body = filePath;

      return request.post(options, callback);
    }

    fs
      .createReadStream(filePath)
      .on('error', reject)
      .pipe(request.post(options, callback));
  });
};

B2Storage.prototype.acquireUploadUrl = function acquireUploadUrl() {
  const promise = new Promise((resolve, reject) => {
    if (this.urlPool.length) {
      return Promise.resolve(this.urlPool.pop());
    }

    // We need to wrap this promise in another promise
    // because the underlying `b2` module throws an error
    // outside the promise context when no authorization
    // token is provided. We need to catch this.
    return this.client
      .getUploadUrl(this.options.bucketId)
      .then(resolve)
      .catch(reject);
  });

  return promise.catch(err => {
    if (err.message === 'Invalid authorizationToken') {
      return this
        .init()
        .then(() => this.acquireUploadUrl());
    }

    throw err;
  });
};

B2Storage.prototype.releaseUploadUrl = function releaseUploadUrl(info) {
  this.urlPool.push(info);
};
