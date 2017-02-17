const db = require('../db');

const { getNotFoundError } = require('./errors');

module.exports = class Users {
 static get(req, type, id) {
   return db
     .get('users', type, id)
     .catch(err => {
       req.log.error(err);

       if (err.status === 404) {
         throw getNotFoundError();
       }

       throw err;
     });
 }

  static findOne(req, filterOptions) {
   return db
     .filter('users', 'profile', filterOptions);
 }
};
