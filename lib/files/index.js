'use strict';

const router = module.exports = require('express').Router();

router
  .route('/files')
  .post(
    require('./upload'),
    require('./processor')
  );
