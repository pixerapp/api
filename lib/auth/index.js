'use strict';

const { getUnauthorizedError, getInvalidAuthProviderError } = require('./errors');
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
      /*
      * `user` should have at least the following properties:
      * - id: a string value.
      * */
      req.user = user;

      next();
    })
    .catch(err => {
      if (err.status === 404) {
        // The user has not been found in the system.
        return next(getUnauthorizedError());
      }

      next(err);
    });
};
