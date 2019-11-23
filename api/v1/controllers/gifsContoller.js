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
  // add code

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
      client.query(query, data, (error, result) => {
        done();
        if (error) {
          res.status(403).json({
            status: 'error',
            error,
          });
        } else if (result.rows[0] === undefined) {
          res.status(400).json({
            status: 'error',
            error: 'Bad request',
          });
        } else {
          res.status(200).json({
            status: 'success',
            data: {
              gifId: result.rows[0].id,
              message: 'Gif image successfully uploaded',
              createdOn: result.rows[0].created_on,
              title: result.rows[0].title,
              imageUrl: result.rows[0].image_url,
            },
          });
        }
      });
    });
  });
};
