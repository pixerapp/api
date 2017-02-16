function getInvalidAuthorizationError() {
  return {
    status: 400,
    error: 'Invalid authorization token.',
  };
}

function getInvalidTokenError() {
  return {
    status: 400,
    error: 'Invalid token for application.',
  };
}

function getInvalidAuthProviderError() {
  return {
    status: 400,
    error: 'Invalid authorization provider.',
  };
}

function getUnauthorizedError() {
  return {
    status: 401,
    error: 'Unauthorized.',
  };
}

function getUnexpectedResponseError() {
  return {
    status: 500,
    error: 'Unexpected response from the upstream.',
  };
}

module.exports = {
  getInvalidAuthorizationError,
  getInvalidAuthProviderError,
  getInvalidTokenError,
  getUnauthorizedError,
  getUnexpectedResponseError,
};
