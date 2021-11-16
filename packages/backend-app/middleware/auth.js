const config = require('config');
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  ///all mddleware functions should get these three items
  const token = req.header('x-auth-token');
  if (!token) {
    return res
      .status(401)
      .json({ msg: 'No token provided (user most likely not logged in)' });
  }
  try {
    const decoded = jwt.verify(token, config.get('JWTSecret'));
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ msg: 'Token not valid' });
  }
}

module.exports = auth;
