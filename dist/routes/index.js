"use strict";

var express = require('express');
var getImage = require('../controllers/api.controller');
var router = express.Router();
router.route('/image').post(getImage);
module.exports = router;