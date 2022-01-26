'use strict';

const base64 = require('base-64');

module.exports = (users) => (req, res, next) => {


  if (!req.headers.authorization) { next('Invalid Login'); return; }

  let basic = req.headers.authorization.split(' ').pop();

  let [user, pass] = base64.decode(basic).split(':');


  return users.authenticateBasic(user, pass)
    .then(validUser => {
      req.user = validUser;
      next();
    })
    .catch(err => next('Invalid Login'));
};
