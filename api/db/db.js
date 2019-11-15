const { Pool } = require('pg');

const config = {
  user: 'kodekage',
  host: 'localhost',
  database: 'teamwork',
  password: 'oparaprosper081',
  port: 5432,
};

const pool = new Pool(config);
pool.on('connect', () => {
  console.log('Connection to database successful');
});

module.exports = pool;
