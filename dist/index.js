"use strict";

var express = require('express');
require('dotenv').config({
  path: '.env.local'
});
var cors = require('cors');
var bodyParser = require('body-parser');
var _require = require('../config.js'),
  PORT = _require.PORT;
var routes = require('./routes/index.js');
var errorHandler = require('./middlewares/errorHandler.js');
var routeNotFoundHandler = require('./middlewares/routeNotFoundHandler.js');
var app = express();
app.use(cors());
app.use(bodyParser.json({
  limit: '25mb'
}));
app.use(bodyParser.urlencoded({
  limit: '25mb',
  extended: true
}));
app.use(express.json());
app.use(express.urlencoded({
  limit: '25mb',
  extended: true
}));
app.get('/', function (req, res) {
  res.status(200).json({
    success: true,
    message: 'Server running'
  });
});
app.use('/v1', routes);

//Error handler
app.use(errorHandler);
app.use(routeNotFoundHandler);
app.listen(PORT, function () {
  console.log("Server started on port ".concat(PORT));
});