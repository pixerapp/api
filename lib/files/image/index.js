'use strict';

/* External dependencies */
const Sharp = require('sharp');
/* Local dependencies */
const {
  processExifMeta,
} = require('./helpers');
function getMetadata(req, file) {
  const image = new Sharp(file.path, {
    quality: 60,
  });

  return image
    .metadata()
    .then(metadata => {
      return processExifMeta(req, metadata);
    });
}

module.exports = {
  getMetadata,
};
