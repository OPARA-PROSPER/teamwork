
const express = require('express');
const bodyParser = require('body-parser');
// const ejsYield = ;
const authRoute = require('./routes/auth');

const app = express();

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(require('ejs-yield'));

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  next();
});
app.use('/api/v1', authRoute);

app.get('/', (req, res) => {
  res.layout('index', { title: 'Team Work | making collaboration seem less for remote teams' });
});

module.exports = app;
