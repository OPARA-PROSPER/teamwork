require('dotenv').config();
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2;
const pool = require('../db/db');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

exports.postGifs = (req, res) => {
  cloudinary.uploader.upload(req.body.image, (error, result) => {
    if (error) {
      res.status(400).json({
        status: 'error',
        error,
      });
    } else if (result === undefined) {
      res.status(400).json({
        status: 'error',
        error: 'Cloudinary could not upload the image',
      });
    }

    const token = req.headers.authorization;
    const verifyToken = jwt.verify(token, 'TEAMWORK_SECRET_KEY');
    const { userID } = verifyToken;

    pool.connect((err, client, done) => {
      if (error) {
        res.status(400).json({
          status: 'error',
          error: err,
        });
      }
      const query = 'INSERT INTO gifs(title, image_url, user_id) VALUES ($1, $2, $3) RETURNING *';
      const data = [req.body.title, result.url, userID];
      client.query(query, data, (queryError, queryResult) => {
        done();
        if (error) {
          res.status(403).json({
            status: 'error',
            error: queryError,
          });
        } else if (queryResult.rows[0] === undefined) {
          res.status(400).json({
            status: 'error',
            error: 'Bad request',
          });
        } else {
          res.status(200).json({
            status: 'success',
            data: {
              gifId: queryResult.rows[0].id,
              message: 'Gif image successfully uploaded',
              createdOn: queryResult.rows[0].created_on,
              title: queryResult.rows[0].title,
              imageUrl: queryResult.rows[0].image_url,
            },
          });
        }
      });
    });
  });
};

exports.deleteGifs = (req, res) => {
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
    const query = 'SELECT * FROM gifs WHERE id=$1';
    const deleteGifs = 'DELETE FROM gifs WHERE id=$1 AND user_id=$2';

    client.query(query, [req.params.id], (queryError, result) => {
      if (queryError) {
        res.status(400).json({
          status: 'error',
          error: queryError,
        });
      } else if (result.rows[0] === undefined) {
        res.status(400).json({
          status: 'error',
          error: 'Resource not found',
        });
      } else {
        client.query(deleteGifs, [result.rows[0].id, userID], (deleteGifsError) => {
          done();

          if (deleteGifsError) {
            res.status(400).json({
              status: 'error',
              error: `there was an error ${deleteGifsError}`,
            });
          } else {
            res.status(200).json({
              status: 'success',
              data: {
                message: 'gif post successfully deleted',
              },
            });
          }
        });
      }
    });
  });
};

exports.commentGifs = (req, res) => {
  pool.connect((error, client, done) => {
    const getGif = 'SELECT title FROM gifs WHERE id=$1';
    const gifComment = 'INSERT INTO gif_comments(comment, gif_id) VALUES($1, $2) RETURNING *';

    client.query(getGif, [req.params.id], (getGifError, result) => {
      if (getGifError) {
        res.status(400).json({
          status: 'error',
          error: `could not get Gif article: ${getGifError}`,
        });
      } else if (result.rows[0] === undefined) {
        res.status(400).json({
          status: 'error',
          error: 'Could not gif id',
        });
      }

      client.query(gifComment,
        [req.body.comment, req.params.id],
        (gifCommentError, gifCommentResult) => {
          done();
          if (gifCommentError) {
            res.status(400).json({
              status: 'error',
              error: `Could not save the comment: ${gifCommentError}`,
            });
          } else if (gifCommentResult.rows[0] === undefined) {
            res.status(400).json({
              status: 'error',
              error: 'The resources could not be fetched',
            });
          } else {
            res.status(200).json({
              status: 'success',
              data: {
                message: 'comment successfully created',
                createdOn: gifCommentResult.rows[0].created_on,
                gifTitle: result.rows[0].title,
                comment: gifCommentResult.rows[0].comment,
              },
            });
          }
        });
    });
  });
};
