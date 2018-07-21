const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');

app.use(morgan('dev'));
app.use(bodyParser.json());

app.use('/api/listener', require('./listener-router'));
app.use('/api/digest', require('./digest-router'));

module.exports = app;
