'use strict';

const config = require('config');

const Files = require('./files');

module.exports = function processFile(req, res, next) {
  const { file } = req;

  return Files
    .process(req)
    .then(file => {
      file.status = 201;

      next(file);
    })
    .catch(next);

};
