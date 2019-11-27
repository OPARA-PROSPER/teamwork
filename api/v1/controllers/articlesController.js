const jwt = require('jsonwebtoken');
const pool = require('../db/db');

exports.getArticles = (req, res) => {
  pool.connect((error, client, done) => {
    if (error) {
      res.status(400).json({
        status: 'error',
        error,
      });
    }

    const query = 'SELECT * FROM articles ORDER BY id ASC';

    client.query(query, (queryError, result) => {
      done();
      if (queryError) {
        res.status(400).json({
          status: 'error',
          error: queryError,
        });
      } else if (result.rows === undefined) {
        res.status(400).json({
          status: 'error',
          error: 'resource not found',
        });
      } else {
        res.status(200).json({
          status: 'success',
          data: result.rows,
        });
      }
    });
  });
};

exports.getArticleById = (req, res) => {
  pool.connect((error, client, done) => {
    if (error) {
      res.status(400).json({
        status: 'error',
        error,
      });
    }

    const query = 'SELECT id,title,article,createdat FROM articles WHERE id=$1';
    const getComment = 'SELECT id,comment,author_id FROM article_comments WHERE article_id=$1';
    client.query(query, [req.params.id], (queryError, result) => {
      // done();
      if (queryError) {
        res.status(400).status({
          status: 'error',
          error: `There was an error: ${queryError}`,
        });
      } else if (result.rows[0] === undefined) {
        res.status(400).json({
          status: 'error',
          error: 'Article not found',
        });
      } else {
        client.query(getComment, [result.rows[0].id], (getCommentError, getCommentResult) => {
          done();

          if (getCommentError) {
            res.status(400).json({
              status: 'error',
              error: getCommentError,
            });
          } else if (getCommentResult.rows[0] === undefined) {
            res.status(400).json({
              status: 'error',
              error: 'Article comment not found',
            });
          } else {
            res.status(200).json({
              status: 'success',
              data: {
                id: result.rows[0].id,
                createdOn: result.rows[0].createdat,
                title: result.rows[0].title,
                article: result.rows[0].article,
                comments: getCommentResult.rows,
              },
            });
          }
        });
      }
    });
  });
};

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

exports.deleteArticle = (req, res) => {
  pool.connect((error, client, done) => {
    if (error) {
      res.status(400).json({
        status: 'error',
        error,
      });
    }

    const token = req.headers.authorization;
    const verifyToken = jwt.verify(token, 'TEAMWORK_SECRET_KEY');
    const { userID } = verifyToken;
    const query = 'SELECT * from articles WHERE id=$1';
    const deleteArticle = 'DELETE FROM articles WHERE id=$1 AND userid=$2';

    client.query(query, [req.params.id], (queryError, result) => {
      if (queryError) {
        res.status(400).json({
          status: 'error',
          error: queryError,
        });
      } else if (result.rows[0] === undefined) {
        res.status(400).json({
          status: 'error',
          error: 'The resource not found',
        });
      } else if (result.rows[0].userid === userID) {
        client.query(deleteArticle,
          [req.params.id, userID],
          (deleteQueryError) => {
            done();
            if (deleteQueryError) {
              res.status(400).json({
                status: 'error',
                error: deleteQueryError,
              });
            } else {
              res.status(200).json({
                status: 'success',
                data: {
                  message: 'Article successfully deleted',
                },
              });
            }
          });
      } else {
        res.status(400).json({
          status: 'error',
          error: 'You don\'t have the permission to delete this resource',
        });
      }
    });
  });
};

exports.commentArticle = (req, res) => {
  pool.connect((error, client, done) => {
    const getArticle = 'SELECT title, article FROM articles WHERE id=$1';

    client.query(getArticle, [req.params.id], (getArticleQueryError, result) => {
      if (getArticleQueryError) {
        res.status(400).json({
          status: 'error',
          error: `Could not find resource ${getArticleQueryError}`,
        });
      }

      const token = req.headers.authorization;
      const verifyToken = jwt.verify(token, 'TEAMWORK_SECRET_KEY');
      const { userID } = verifyToken;
      const query = 'INSERT INTO article_comments(comment, article_id, author_id) VALUES ($1, $2, $3) RETURNING *';
      const data = [req.body.comment, req.params.id, userID];

      client.query(query, data, (queryError, queryResult) => {
        done();

        if (queryError) {
          res.status(400).json({
            status: 'error',
            error: queryError,
          });
        } else if (queryResult.rows[0] === undefined) {
          res.status(400).json({
            status: 'error',
            error: 'could not inssert data into the database',
          });
        } else {
          res.status(200).json({
            status: 'success',
            data: {
              message: 'comment successfully created',
              createdOn: queryResult.rows[0].created_on,
              articleTitle: result.rows[0].title,
              article: result.rows[0].article,
              comment: queryResult.rows[0].comment,
            },
          });
        }
      });
    });
  });
};
