const express = require('express');
const router = express.Router();
var passport = require('passport')

/* GET home page. */
router.get('/', function(req, res) {
  res.send('index page');
});



module.exports = router;
