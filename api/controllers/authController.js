const jwt = require('jsonwebtoken');
const pool = require('../db/db');

exports.getUsers = (req, res) => {
  pool.connect((err, client, done) => {
    if (err) {
      res.status(400).json({
        status: 'error',
        err,
      });
    }

    const query = 'SELECT * FROM users';

    client.query(query, (error, result) => {
      done();

      if (error) {
        res.status(400).json({
          status: 'error',
          error,
        });
      } else if (result.rows === undefined) {
        res.status(400).json({
          status: 'error',
          error: 'Bad request',
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

exports.createUSer = (req, res) => {
  const data = {
    firstName: req.body.firstname,
    lastName: req.body.lastname,
    email: req.body.email,
    password: req.body.password,
    gender: req.body.gender,
    jobRole: req.body.jobrole,
    department: req.body.department,
    address: req.body.address,
  };

  pool.connect((err, client, done) => {
    if (err) {
      console.log('Unable to connect to the database: ', err);
      res.status(400).send({
        status: 'error',
        err,
      });
    }

    const query = 'INSERT INTO users(firstname, lastname, email, password, gender, jobrole, department, address) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *';
    const values = [
      data.firstName, data.lastName,
      data.email, data.password,
      data.gender, data.jobRole,
      data.department, data.address,
    ];

    client.query(query, values, (error, result) => {
      done();
      if (error) {
        res.status(400).json({
          status: 'error',
          error: error,
        });
      } else if(result.rows[0] === undefined) {
        res.status(403).json({
          status: 'error',
          error: 'Bad request',
        });
      } else {
        res.status(200).json({
          status: 'success',
          data: {
            message: 'User account successfully created',
            token: req.headers.authorization,
            userID: result.rows[0].id,
          },
        });
      }
    });
  });
};

exports.signIn = (req, res) => {
  pool.connect((err, client, done) => {
    if (err) {
      console.log('Unable to connect to the database: ', err);
      res.status(400).send({
        status: 'error',
        error: err,
      });
    }

    const query = 'SELECT * FROM users WHERE email=$1 AND password=$2';
    const data = {
      email: req.body.email,
      password: req.body.password,
    };

    client.query(query, [data.email, data.password], (error, result) => {
      done();

      if (error) {
        res.status(400).json({
          status: 'error',
          error,
        });
      } else if (result.rows[0] === undefined) {
        res.status(400).json({
          status: 'error',
          error: 'Bad request',
        });
      } else {
        const token = jwt.sign(
          { role: result.rows[0].jobrole },
          'TEAMWORK_SECRET_KEY',
          { expiresIn: '24h' },
        );

        res.status(200).json({
          status: 'success',
          data: {
            token,
            userID: result.rows[0].id,
          },
        });
      }
    });
  });
};
