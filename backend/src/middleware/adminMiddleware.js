exports.admin = function (req, res, next) {
  if (req.user && req.user.role === 'system_admin') {
    next();
  } else {
    res.status(403).json({ msg: 'Access denied. Admins only.' });
  }
};
