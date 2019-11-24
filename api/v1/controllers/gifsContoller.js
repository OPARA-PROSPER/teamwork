require('dotenv').config();
// const jwt = require('jsonwebtoken');
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
    pool.connect((err, client, done) => {
      if (error) {
        res.status(400).json({
          status: 'error',
          error: err,
        });
      }
      const query = 'INSERT INTO gifs(title, image_url) VALUES ($1, $2) RETURNING *';
      const data = [req.body.title, result.url];
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
      res.status(200).json({
        status: 'error',
        error,
      });
    }

    const query = 'SELECT * FROM gifs WHERE id=$1';
    const deleteGifs = 'DELETE FROM gifs WHERE id=$1 AND user_id=$1';

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
        client.query(deleteGifs, [result.rows[0].id, req.params.id], (deleteGifsError) => {
          done();

          if (deleteGifsError) {
            res.status(400).json({
              status: 'error',
              error: deleteGifsError,
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
