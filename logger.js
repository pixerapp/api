'use strict';

const config = require('config');
const cuid = require('cuid');

const log = require('bunyan').createLogger({
  level: config.get('logger.level'),
  name: require('./package.json').name,
  stream: require('fs').createWriteStream(config.get('logger.file.path')),
});

function getRequestMetrics(req) {
  const requestUrl = req.originalUrl;
  const { requestStartTime } = req.timers;

  return {
    requestUrl,
    requestStartTime,
  };
}

function getResponseMetrics(req, res) {
  const responseEndTime = new Date;
  const { requestStartTime } = req.timers;
  const { statusCode } = res;

  return {
    requestStartTime,
    responseDuration: responseEndTime - requestStartTime,
    responseEndTime,
    statusCode,
  };
}

function errorMiddleware(err, req, res, next) {
  req.log.error(err);

  const status = 500;
  const message = process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;

  res
    .status(status)
    .json({
      status,
      message,
    });
}

function requestMiddleware(req, res, next) {
  const requestId = req.id = cuid();
  const { end } = res;

  req.log = log.child({
    requestId,
  });

  req.timers = {
    requestStartTime: new Date,
  };

  req.log.info(getRequestMetrics(req), 'request');

  res.end = function (chunk, encoding) {
    res.end = end;
    res.end(chunk, encoding);

    req.log.info(getResponseMetrics(req, res), 'response');
  };

  next();
}

function responseMiddleware(response, req, res, next) {
  const { status } = response;

  console.log(response, status);

  res
    .status(status)
    .json(response);
}

module.exports = {
  errorMiddleware,
  log,
  requestMiddleware,
  responseMiddleware,
};
