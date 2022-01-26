'use strict';

module.exports = (capability) => (req, res, next) => {
  const acl = {
    'user': ['read'],
    'editor': ['read', 'update'],
    'writer': ['read', 'create'],
    'admin': ['read', 'create', 'update', 'delete'],
  };

  if (acl[req.user.role].includes(capability)) {
    next();
  } else {
    next('Unauthorized');
  }
};