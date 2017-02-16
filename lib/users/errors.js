'use strict';

function getNotFoundError() {
  let error = new Error('Such user does not exist.');
  error.status = 404;
  
  return error;
}

module.exports = {
  getNotFoundError,
};
