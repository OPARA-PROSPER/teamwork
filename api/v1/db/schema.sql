CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  firstname VARCHAR(50) NOT NULL,
  lastname VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(20) NOT NULL,
  gender VARCHAR(10) NOT NULL,
  joberole VARCHAR(20) NOT NULL,
  department VARCHAR(50) NOT NULL,
  address VARCHAR(150) NOT NULL
);

CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  article VARCHAR(10000) NOT NULL,
  userid INT NOT NULL,
  createdat TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO users(
  firstname,
  lastname,
  email,
  password,
  gender,
  jobrole,
  department,
  address)
VALUES (
  'prosper',
  'opara',
  'oparaprosper@gmail.com',
  'hicopara',
  'male',
  'admin',
  'software development',
  'FUTO')
RETURNING id, firstname, jobrole;