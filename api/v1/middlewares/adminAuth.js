const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (token) {
      const verifyToken = jwt.verify(token, 'TEAMWORK_SECRET_KEY');
      const { role } = verifyToken;

      if (role !== 'admin') {
        res.status(401).json({
          status: 'error',
          error: 'Bad request: you are not an admin',
        });
      } else {
        next();
      }
    } else {
      res.status(400).json({
        status: 'error',
        error: 'Login to get an authentication token',
      });
    }
  } catch (err) {
    res.status(401).json({
      status: 'error',
      error: `You are not authorized: ${err}`,
    });
  }
};
