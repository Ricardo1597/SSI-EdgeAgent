var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken') 
const passport = require('passport');
const sdk = require('indy-sdk');
const indy = require('../indy/index.js');
require('dotenv/config')

const UserModel = require('../models/users')



/* Check user token */
router.get('/checkToken', passport.authenticate('jwt', {session: false}), (req, res) => {
  res.sendStatus(200);
});

/* Check user token */
router.post('/refreshToken', passport.authenticate('refresh', {session: false}), async (req, res) => {
  // If it has passed the middleware, the cookie refresh token is valid
  console.log("cheguei")
  const newAccessToken = jwt.sign(
    { user : req.user }, 
    process.env.ACCESS_TOKEN_SECRET, 
    {expiresIn: '15m'}
  );
  
  res.status(200).send({ok: true, accessToken: newAccessToken});
});


// REGISTER
router.post('/register', checkNotAuthenticated, async (req, res) => {
  const { name, username, password, password2 } = req.body;
  console.log(req.body)

  // Check required fields
  if(!name || !username || !password || !password2)
    return res.status(400).send('Please fill in all fields')

  // Check if passwords match
  if(password !== password2) 
    res.status(400).send('Passwords do not match')

  try {
    await indy.wallet.setup(username+'_wallet', password);
    console.log('wallet created')

    return res.sendStatus(200)

  } catch(error) {
    if(error.indyCode === 203) {
      return res.status(400).send("Account already exists. Please try signing in.")
    }
    console.log(error);
    return res.status(400).send("Error while registering:" + error);
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


router.post('/login', checkNotAuthenticated, (req,res,next) => {
  passport.authenticate('login', async (err, user, info) => {  
    try {
      if(err || !user){
            if(err){
              return next(err);
            }
            else{
              res.status(401).send({message: 'Invalid credentials'});
              //return next(new Error('Invalid credentials'))
            }               
        }

        req.login(user, { session : false }, async (error) => {
            if( error ) return next(error)

            // Geração dos tokens (access and refresh)
            var accessToken = jwt.sign(
              { user : user }, 
              process.env.ACCESS_TOKEN_SECRET, 
              {expiresIn: '15s'}
            );
            var refreshToken = jwt.sign(
              { user : user }, 
              process.env.REFRESH_TOKEN_SECRET, 
              {expiresIn: '7d'}
            );

            let dids = await sdk.listMyDidsWithMeta(await indy.wallet.get());
            
            dids = await Promise.all(dids.map(async (did) => {    
              let getDidResponse = await indy.ledger.getNym(did.did);
              let didInfo = JSON.parse(getDidResponse.result.data) 
          
              did.role = (didInfo ? didInfo.role : "no role");
          
              return did;
            }))  
          
            res.cookie('refreshToken', refreshToken, { 
              httpOnly: true,
              path: "/users/refreshToken"
            }).status(200).send({accessToken: accessToken, dids: dids});
        });     
    } 
    catch (error) {
        return next(error);
    }
  }) (req, res, next);
});

// LOGOUT
router.post('/logout', async (req,res) => {
  await indy.wallet.close();
  console.log('wallet closed')

  req.logout();

  // Clear cookie (refresh token)
  return res.cookie(
    'refreshToken', 
    "",
    { httpOnly: true }
  ).status(200).send()
})



// Prevent an authenticated user from accessing login or 
// register while authenticated
function checkNotAuthenticated(req, res, next) {
  const token = req.session.token
  if(!token) return next();
  else{
    try {
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      res.redirect('/');
    } catch (err) {
      return next();
    }
  }
}

module.exports = router;


