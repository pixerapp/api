#!/usr/bin/env node
'use strict';

/* External dependencies */
const fs = require('fs');
const path = require('path');
const Sharp = require('sharp');

/* Local dependencies */

const dir = path.join(__dirname, 'test-images');
const originalFileName = 'IMG_6775';
const filePath = path.join(dir, `${originalFileName}.JPG`);

const formats = ['jpeg', 'webp'];
const HEIGHT = 640;
const WIDTH = 640;
let image = new Sharp(filePath, {
  quality: 60
})
  .rotate()
  .resize(WIDTH, HEIGHT)
  .max();

Promise
  .all(formats.map(format => {
    return image
      .toFormat(format)
      .toBuffer()
      .then(buffer => {
        const filename = `${originalFileName}-${WIDTH}x${HEIGHT}.${format}`;

        const thumb = {
          path: path.join(dir, filename),
          format,
          height: HEIGHT,
          width: WIDTH,
          filename,
          mimetype: `image/${format}`,
          size: buffer.length,
        };

        return saveFile(thumb, buffer);
      })
  }));

function saveFile(thumb, buffer) {
  return new Promise((resolve, reject) => {
    fs.writeFile(thumb.path, buffer, function (err) {
      if (err) {
        return reject(err);
      }

      resolve();
    })
  });
}
