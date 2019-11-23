const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (token) {
      const verifyToken = jwt.verify(token, 'TEAMWORK_SECRET_KEY');
      const { role } = verifyToken;

      if (role === 'admin' || role === 'employee') {
        next();
      } else {
        res.status(403).json({
          status: 'error',
          error: 'Bad request: you do not have the permission to view this resource',
        });
      }
    } else {
      res.status(400).json({
        status: 'error',
        error: 'No authentication token supplied',
      });
    }
  } catch (error) {
    res.status(401).json({
      status: 'error',
      error,
    });
  }
};
