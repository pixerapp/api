'use strict';

/* External dependencies */
const config = require('config');

/* Outer dependencies */
const Storage = require('./b2');

const storage = new Storage({
  accountId: config.get('b2.accountId'),
  applicationKey: config.get('b2.applicationKey'),
  bucketId: config.get('b2.bucketId'),
});

module.exports = storage;
