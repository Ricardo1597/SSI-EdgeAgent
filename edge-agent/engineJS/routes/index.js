var express = require('express');
var router = express.Router();
var passport = require('passport');
const indy = require('../indy/index.js');

/* GET home page. */
router.get('/', function (req, res) {
  res.send('index page');
});

module.exports = router;
