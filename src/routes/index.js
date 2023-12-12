const express = require('express');
const getImage = require('../controllers/api.controller');
const router = express.Router();

router.route('/image').post(getImage);

module.exports = router;
