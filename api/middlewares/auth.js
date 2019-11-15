const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verifyToken = jwt.verify(token, "TEAMWORK_SECRET_KEY");
    const userID = verifyToken.userID;

    if (req.body.id && req.body.id !== userID) {
      res.status(400).json({
        status: 'error',
        error: "Invalid user ID",
      })
    }else{
      next();
    }
  } catch {
    res.status(401).json({
      status: 'error',
      error: 'You are authorized'
    });
  }
};
