const db = require('../db');

const { getNotFoundError } = require('./errors');
const User = require('./user');

module.exports = class Users {
 static get(req, type, id) {
   return db
     .get('users', type, id)
     .then(res => {
       const { _source } = res;

       return new User(Object.assign({
         _id: _source.profileId
       }, _source));
     })
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
