require('dotenv').config();

const { Pool } = require('pg');

const config = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

const pool = new Pool(config);
pool.on('connect', () => {
  console.log('Connection to database successful');
});

module.exports = pool;
