'use strict';

const config = require('config');
const express = require('express');

const authMiddleware = require('./lib/auth');
const {
  errorMiddleware,
  log,
  requestMiddleware,
  responseMiddleware,
} = require('./logger');

const app = express();

app.use(requestMiddleware);
app.use(authMiddleware);
app.use(require('./lib/files'));
app.use(responseMiddleware);
app.use(errorMiddleware);

const server = app.listen(config.get('port'), () => {
  log.info(`Web server is listening on port ${server.address().port}.`);
});

module.exports = app;
