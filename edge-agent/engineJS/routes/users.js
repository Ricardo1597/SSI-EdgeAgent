'use strict';
var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const passport = require('passport');
const sdk = require('indy-sdk');
const indy = require('../indy/index.js');
const config = require('../config');
require('dotenv/config');

const {
  getRefreshTokenVersion,
  incrementRefreshTokenVersion,
} = require('../authentication/refreshToken');

/* Check user token */
router.get('/check-token', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.sendStatus(200);
});

/* Check user token */
router.post(
  '/refresh-token',
  passport.authenticate('refresh', { session: false }),
  async (req, res) => {
    // If it has passed the middleware, the cookie refresh token is valid
    const newAccessToken = jwt.sign({ user: req.user }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '15m',
    });

    return res.status(200).send({ accessToken: newAccessToken });
  }
);

// REGISTER
router.post('/register', checkNotAuthenticated, async (req, res) => {
  const { name, username, password1, password2 } = req.body;

  // Check required fields
  if (!name || !username || !password1 || !password2)
    return res.status(400).send('Please fill in all fields');

  // Check if passwords match
  if (password1 !== password2) return res.status(400).send('Passwords do not match');

  try {
    await indy.wallet.setup(username + '_wallet', password1);
    console.log('wallet created');

    return res.sendStatus(200);
  } catch (error) {
    if (error.indyCode === 203) {
      return res.status(400).send('Account already exists. Please try signing in.');
    }
    console.log(error);
    return res.status(400).send('Error while registering:' + error);
  }
  /*
  // Check if the user is already in the database
  const userExist = await UserModel.findOne({username: username});
  if(userExist) 
    return res.status(400).send('Username is already registered')
  console.log("user nao existe")

  // Create a new user
  const user = new UserModel({
    name,
    username,
    password
  });
    
  user.save()
    .then(async (user) => {
      console.log('user criado')
    })
    .catch(err => {
      console.log(err);
      return res.status(400).send("Error while registering:" + err);
    })
  */
});

router.post('/login', checkNotAuthenticated, (req, res, next) => {
  passport.authenticate('login', async (err, user, info) => {
    try {
      if (err || !user) {
        if (err) {
          return next(err);
        } else {
          return res.status(401).send({ error: 'Invalid credentials' });
          //return next(new Error('Invalid credentials'))
        }
      }

      req.login(user, { session: false }, async (error) => {
        if (error) return next(error);

        // Load refresh token version
        const version = getRefreshTokenVersion(user.username);

        // Token generation (access and refresh)
        var accessToken = jwt.sign({ user: user }, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: '15m',
        });
        var refreshToken = jwt.sign(
          { user: user, version: version },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: '7d' }
        );

        let dids = await sdk.listMyDidsWithMeta(await indy.wallet.get());

        dids = await Promise.all(
          dids.map(async (did) => {
            let getDidResponse = await indy.ledger.getNym(did.did);
            let didInfo = JSON.parse(getDidResponse.result.data);

            did.role = didInfo ? didInfo.role : 'no role';
            did.metadata = JSON.parse(did.metadata);

            return did;
          })
        );

        // Get all connections
        let connections = await indy.connections.searchConnections({}, true);
        // Sort by last update date (descend)
        if (connections) {
          connections.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
        }

        res
          .cookie('refreshToken' + config.adminPort, refreshToken, {
            httpOnly: true,
            path: '/users/refresh-token',
          })
          .status(200)
          .send({ accessToken, dids, connections });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

// LOGOUT
router.post('/logout', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    await indy.wallet.close();
    console.log('wallet closed');

    // Revoke refresh token by incrementing the stored version
    incrementRefreshTokenVersion(req.user.username);

    req.logout();

    // Clear cookie (refresh token)
    return res
      .cookie('refreshToken' + config.adminPort, '', {})
      .status(200)
      .send();
  } catch (error) {
    res.status(400).send({ error });
  }
});

// Prevent an authenticated user from accessing login or
// register while authenticated
function checkNotAuthenticated(req, res, next) {
  try {
    const token = req.headers.Authorization.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return res.redirect('/');
  } catch (error) {
    return next();
  }
}

module.exports = router;
