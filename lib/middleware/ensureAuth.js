const User = require('../models/User');

module.exports = (req, res, next) => {
  // 1. read the session cookie
  const token = req.cookies.session;
  // 2. verify the session cookie
  const user = User.verifyToken(token);
  // 3. set req.user to the owner of the session cookie
  req.user = user;
  
  next();
};
