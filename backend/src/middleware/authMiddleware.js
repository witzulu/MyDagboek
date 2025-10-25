const jwt = require('jsonwebtoken');
const config = require('../config');

exports.protect = function (req, res, next) {
  // Try both header types
  let token = req.header('x-auth-token');

  if (!token) {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  // Still no token
  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);
    return res.status(401).json({ msg: 'Token is not valid', error: err.message });
  }
};

exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};
