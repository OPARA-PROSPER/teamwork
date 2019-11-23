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
          error,
        });
      } else if (result.rows[0] === undefined) {
        res.status(403).json({
          status: 'error',
          error: 'Bad request',
        });
      } else {
        const token = jwt.sign(
          {
            userID: result.rows[0].id,
            name: result.rows[0].firstName,
            role: result.rows[0].jobrole,
          },
          'TEAMWORK_SECRET_KEY',
          { expiresIn: '24h' },
        );

        res.status(200).json({
          status: 'success',
          data: {
            message: 'User account successfully created',
            token,
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
          {
            userID: result.rows[0].id,
            name: result.rows[0].firstname,
            role: result.rows[0].jobrole,
          },
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
        client.query(updateTable, data, (error, result) => {
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
