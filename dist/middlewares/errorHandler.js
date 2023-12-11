"use strict";

var errorHandler = function errorHandler(req, res, next) {
  res.status(500).send({
    success: false,
    message: 'Internal Server Error'
  });
};
module.exports = errorHandler;