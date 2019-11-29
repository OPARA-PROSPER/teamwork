const jwt = require('jsonwebtoken');
const pool = require('../db/db');

exports.getUsers = (req, res) => {
  pool.connect((error, client, done) => {
    if (error) return res.status(400).json({ status: 'error', error });

    const query = 'SELECT * FROM users';

    client.query(query, (queryError, result) => {
      done();
      if (queryError) return res.status(400).json({ status: 'error', error: `${queryError}` });
      if (result.rows.length === 0) {
        res.status(400).json({ status: 'error', error: 'Bad request' });
      } else {
        res.status(200).json({ status: 'success', data: result.rows });
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

  pool.connect((error, client, done) => {
    if (error) {
      res.status(400).send({
        status: 'error',
        error: `${error}`,
      });
    }

    const query = 'INSERT INTO users(firstname, lastname, email, password, gender, jobrole, department, address) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, firstname, jobrole';
    const values = [
      data.firstName, data.lastName,
      data.email, data.password,
      data.gender, data.jobRole,
      data.department, data.address,
    ];

    client.query(query, values, (queryError, queryResult) => {
      done();
      if (queryError) return res.status(400).json({ status: 'error', error: `${queryError}` });
      if (queryResult.rows.length === 0) {
        res.status(400).json({ status: 'error', error: 'Bad request' });
      } else {
        const token = jwt.sign(
          {
            userID: queryResult.rows[0].id,
            name: queryResult.rows[0].firstname,
            role: queryResult.rows[0].jobrole,
          },
          'TEAMWORK_SECRET_KEY',
          { expiresIn: '24h' },
        );

        res.status(200).json({
          status: 'success',
          data: {
            message: 'User account successfully created',
            token,
            userID: queryResult.rows[0].id,
          },
        });
      }
    });
  });
};

exports.signIn = (req, res) => {
  if (Object.keys(req.body).length === 0) return res.status(404).json({ status: 'error', error: 'empty request bidy' });

  pool.connect((error, client, done) => {
    if (error) res.status(400).send({ status: 'error', error });

    const query = 'SELECT id,firstname,jobrole FROM users WHERE email=$1 AND password=$2';
    const data = { email: req.body.email, password: req.body.password };

    client.query(query, [data.email, data.password], (queryError, queryResult) => {
      done();

      if (queryError) res.status(400).json({ status: 'error', error: `${queryError}` });
      if (queryResult.rows.length === 0) {
        res.status(404).json({
          status: 'error',
          error: 'user not found: incorrect email or password',
        });
      } else {
        const token = jwt.sign({
          userID: queryResult.rows[0].id,
          name: queryResult.rows[0].firstname,
          role: queryResult.rows[0].jobrole,
        },
        'TEAMWORK_SECRET_KEY',
        { expiresIn: '24h' });

        res.status(200).json({
          status: 'success',
          data: { token, userID: queryResult.rows[0].id },
        });
      }
    });
  });
};
