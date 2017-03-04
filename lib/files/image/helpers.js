'use strict';

/* External dependencies */
const config = require('config');
const crypto = require('crypto');
const exif = require('exif-reader');

/* Local dependencies */
const gps = require('./gps');

function getImagePropertyKeyForThumb(width, height, format) {
  return `t${width}x${height}-${format}`;
}

function getImageSizes() {
  /*
  * http://www.kylejlarson.com/blog/iphone-6-screen-size-web-design-tips/
  * http://viewportsizes.com/?filter=samsung%20galaxy
  * https://deviceatlas.com/blog/most-used-smartphone-screen-resolutions-in-2016
  * https://blog.bufferapp.com/ideal-image-sizes-social-media-posts
  * https://developers.facebook.com/docs/graph-api/reference/v2.0/photo
  * */
  const sizes = config.get('upload.image.thumbnail.sizes');
  let images = [];

  sizes.forEach(size => images.push({
    height: size,
    width: size,
  }));

  return images;
}

function getSha1(buffer) {
  const hash = crypto.createHash(config.get('b2.digest.algorithm'));

  hash.update(buffer);

  return hash.digest('hex');
}

function processExifMeta(req, metadata) {
  let exifMeta = exif(metadata.exif);
  let { exif: exifData, gps: gpsData, image } = exifMeta;
  let newMeta = {};

  // Remove large properties before logging.
  delete metadata.exif;
  // ICC Profile
  delete metadata.icc;

  req.log.info({ metadata }, 'Image metadata');
  req.log.info({ exifMeta }, 'Image exif');

  const metadataFieldsToInclude = config.get('upload.image.metadata.metaFields');
  const exifFieldsToInclude = config.get('upload.image.metadata.exifFields');
  const exifImageFieldsToInclude = config.get('upload.image.metadata.exifImageFields');
  const bufferProps = config.get('upload.image.metadata.bufferFields');

  function copyFields(source, target, fieldsToInclude) {
    fieldsToInclude.forEach(field => {
      if (source.hasOwnProperty(field)) {
        target[field] = bufferProps.includes(field) ?
          source[field].toString('utf8') : source[field];
      }
    });
  }

  copyFields(metadata, newMeta, metadataFieldsToInclude);
  copyFields(exifData, newMeta, exifFieldsToInclude);
  copyFields(image, newMeta, exifImageFieldsToInclude);

  if (gpsData) {
    newMeta.location = gps.getCoordinatesFromExif(
      gpsData.GPSLatitude, gpsData.GPSLatitudeRef,
      gpsData.GPSLongitude, gpsData.GPSLongitudeRef
    );
  }

  return newMeta;
}

module.exports = {
  getImagePropertyKeyForThumb,
  getImageSizes,
  getSha1,
  processExifMeta,
};
