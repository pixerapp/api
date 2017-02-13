'use strict';

const { getUnauthorizedError, getInvalidAuthProviderError } = require('./authHelper');
const fb = require('./fb');

module.exports = function sessionMiddleWare(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization) {
    return next(getUnauthorizedError());
  }

  const [provider, token] = authorization.split(' ');

  if (!provider || !token) {
    return next(getUnauthorizedError());
  }

  let promise;

  switch (provider) {
    case 'Facebook': promise = fb(req, token);
      break;
    default: return next(getInvalidAuthProviderError());
  }

  promise
    .then(user => {
      req.user = user;

      next();
    })
    .catch(next);
};
