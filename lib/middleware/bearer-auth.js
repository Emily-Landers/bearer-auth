'use strict';

module.exports = (users) => (req, res, next) => {


  if (!req.headers.authorization) { next('Invalid Login'); return; }

  let token = req.headers.authorization.split(' ').pop();

  return users.authenticateBearer(token)
    .then(validUser => {
      req.user = validUser;
      next();
    })
    .catch(err => next('Invalid Login'));
};
