'use strict';

const config = require('config');
const request = require('request-promise-native').defaults({
  baseUrl: `https://graph.facebook.com/v2.8/`,
  // Get a rejection only if the request failed for technical reasons.
  simple: false,
  // Get the full response instead of just the body.
  resolveWithFullResponse: true,
  json: true,
});

const Users = require('../../users');
const {
  getInvalidAuthorizationError,
  getInvalidTokenError,
  getUnexpectedResponseError,
} = require('../errors');

module.exports = function FacebookAuthorization(req, inputToken) {
  const appId = config.get('fb.appId');
  const appAccessToken = `${appId}|${config.get('fb.appSecret')}`;

  function getTokenInfo() {
    const options = {
      uri: `/debug_token`,
      qs: {
        access_token: appAccessToken,
        input_token: inputToken
      }
    };

    return request(options).then(response => {
      const { statusCode, body } = response;

      req.log.info(body, `fb auth response statusCode ${statusCode}`);

      switch (statusCode) {
        case 200: return body;
        case 400: throw getInvalidAuthorizationError();
        default: throw getUnexpectedResponseError();
      }
    });
  }

  function validateToken(tokenInfo) {
    // Ensure this token was issued for our application.
    // Prevents CSRF attacks.
    if (!tokenInfo.data || tokenInfo.data.app_id !== appId) {
      throw getInvalidTokenError();
    }

    return tokenInfo;
  }

  function getUserData(tokenInfo) {
    return Users.get(req, 'fb', tokenInfo.data.user_id);
  }

  return Promise
    .resolve()
    .then(getTokenInfo)
    .then(validateToken)
    .then(getUserData);
};
