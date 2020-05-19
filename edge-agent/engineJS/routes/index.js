const express = require('express');
const router = express.Router();
var passport = require('passport')

/* GET home page. */
router.get('/', function(req, res) {
  res.send('index page');
});

/* GET users listing. */
router.get('/dashboard', passport.authenticate('jwt', {session: false}), (req, res) => {
  res.render('dashboard')
});

module.exports = router;
