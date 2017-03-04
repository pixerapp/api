'use strict';

/* Outer dependencies */
const db = require('../db');

const { getMetadata } = require('./image');
const storage = require('./storage');

module.exports = class Files {
  static process(req) {
    /*
    * A `file` has the following properties.
    *
    * {
         fieldname: 'file',
         originalname: 'DSC08052.JPG',
         encoding: '7bit',
         mimetype: 'image/jpeg',
         destination: './tmp',
         digest: 'dd8611c0ae17e1cbede0e82089a874e1da530b34',
         digestAlgorithm: 'sha1',
         digestDataLength: 1628550,
         filename: 'cizadt6ca0000d40c87hwfq4o',
         path: '/Users/naver/repos/photos-indexer/api/tmp/cizadt6ca0000d40c87hwfq4o',
         size: 1628550
     }
    * */
    let { file, user: { _id: userId } } = req;
    const {
      digest,
      digestAlgorithm,
      encoding,
      mimetype,
      originalname: originalName,
      size
    } = file;
    let body = {
      // Access code should include the ID of the user
      // as well as the ID of the image. The image ID
      // will later be used to allow sharing individual
      // images with other accounts.
      accessCodes: [
        // A user will be able to access all files
        // with his user ID as `accessCode`.
        userId,
        // In addition, the user may access all files
        // which he received
        digest
      ],
      digest,
      digestAlgorithm,
      encoding,
      mimetype,
      originalName,
      requestId: req.id,
      requestStartTime: req.timers.requestStartTime,
      size,
    };

    // First, request a URL from the cloud storage where we
    // can upload the file.
    return Promise
      .resolve()
      .then(() => {
        switch (body.mimetype) {
          case 'image/jpeg': return getMetadata(req, file);
        }
      })
      .then(metadata => {
        Object.assign(body, metadata);

        req.timers.acquireUploadUrlStartTime = new Date;

        return storage.acquireUploadUrl();
      })
      .then(uploadURLInfo => {
        req.timers.acquireUploadUrDuration = new Date - req.timers.acquireUploadUrlStartTime;
        req.log.info(uploadURLInfo, 'Upload URL');

        body.bucketId = uploadURLInfo.bucketId;
        // We add a user ID to the URL to create a folder structure
        // even though there might not be a real folder support in
        // the storage. We also add a unique hash of the file so
        // that we can also append the original file name.
        // It is important to encode the original file name as it
        // will be part of the URL.
        file.filename = `${userId}/${body.digest}/${encodeURIComponent(body.originalName)}`;
        body.url = `${uploadURLInfo.uploadUrl}/${file.filename}`;

        // Then create an intermediary record in our database
        // which holds the information about our new file.
        // The ID will be assigned by the DB.
        return db
          .save('files', 'image', /* no ID */null, body)
          .then(res => {
            body._id = res._id;
            body._index = res._index;
            body._type = res._type;

            // Finally upload the file to the storage.
            return storage.uploadFile(req, uploadURLInfo, file);
          })
          .then(cloudFileInfo => {
            storage.releaseUploadUrl(uploadURLInfo);
            req.log.info(cloudFileInfo, 'Upload file info');

            body.fileId = cloudFileInfo.fileId;

            return db.update('files', 'image', body._id, {
              fileId: cloudFileInfo.fileId
            });
          })
          .then(() => body)
          .catch(err => {
            // TODO: need to catch various expected errors and retry. This includes removing a no longer valid upload URL fro our URL pool.
            storage.releaseUploadUrl(uploadURLInfo);

            // Escalate the error.
            throw err;
          });
      });
  }
};
