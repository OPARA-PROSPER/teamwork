const jwt = require('jsonwebtoken');
const pool = require('../db/db');

exports.postArticles = (req, res) => {
  pool.connect((err, client, done) => {
    if (err) {
      res.status(400).json({
        status: 'error',
        err,
      });
    }

    const token = req.headers.authorization;
    const verifyToken = jwt.verify(token, 'TEAMWORK_SECRET_KEY');
    const { userID } = verifyToken;
    const query = 'INSERT INTO articles(title, article, userid) VALUES ($1, $2, $3) RETURNING *';
    const data = [req.body.title, req.body.article, userID];

    client.query(query, data, (error, result) => {
      done();

      if (error) {
        res.status(400).json({
          status: 'error',
          error,
        });
      } else if (result.rows[0] === undefined) {
        res.status(403).json({
          status: 'error',
          error: 'Bad request',
        });
      } else {
        res.status(200).json({
          status: 'success',
          data: {
            message: 'Article successfully posted',
            articleId: result.rows[0].id,
            createdOn: result.rows[0].createdat,
            title: result.rows[0].title,
          },
        });
      }
    });
  });
};

exports.patchArticle = (req, res) => {
  pool.connect((err, client, done) => {
    if (err) {
      res.status(400).json({
        status: 'error',
        err,
      });
    }

    const token = req.headers.authorization;
    const verifyToken = jwt.verify(token, 'TEAMWORK_SECRET_KEY');
    const { userID } = verifyToken;
    const query = 'SELECT * FROM articles WHERE id = $1';
    const updateTable = 'UPDATE articles SET title = $1, article = $2 WHERE id = $3 RETURNING *';
    const data = [req.body.title, req.body.article, req.params.id];

    client.query(query, [req.params.id], (error, result) => {
      if (result.rows[0].userid === userID) {
        // eslint-disable-next-line no-shadow
        client.query(updateTable, data, (error, result) => {
          done();
          if (error) {
            res.status(400).json({
              status: 'error',
              error,
            });
          }

          res.status(200).json({
            status: 'success',
            data: {
              message: 'Article updated successfully',
              title: result.rows[0].title,
              article: result.rows[0].article,
            },
          });
        });
      } else {
        res.status(403).json({
          status: 'error',
          error: 'You don\'t have the permission to update this resource',
        });
      }
    });
  });
};
