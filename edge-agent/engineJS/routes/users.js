var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken') 
const passport = require('passport');
const sdk = require('indy-sdk');
const indy = require('../indy/index.js');

const UserModel = require('../models/users')



/* Check user token */
router.get('/checkToken', passport.authenticate('jwt', {session: false}), (req, res) => {
  res.sendStatus(200);
});


/* GET users listing. */
router.get('/register', checkNotAuthenticated, (req, res) => {
  res.send('register page')
});


/* GET users listing. */
router.get('/login', checkNotAuthenticated, (req, res) => {
  res.send('login page')
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

      // Create wallet
      await indy.wallet.setup(username+'_wallet', password);
      console.log('wallet created')

      return res.status(200).send({user: user})
    })
    .catch(err => {
      console.log(err);
      return res.status(400).send("Error while registering:" + err);
    })
});


router.post('/login', checkNotAuthenticated, (req,res,next) => {
  const { username, password } = req.body
  passport.authenticate('login', async (err, user, info) => {  
    try {
      if(err || !user){
            if(err){
              return next(err);
            }
            else{
              return next(new Error('Invalid credentials'))
            }               
        }

        req.login(user, { session : false }, async (error) => {
            if( error ) return next(error)
            var myuser = { id : user._id, username : user.username };
            console.log(myuser)
            // Geração do token
            var token = jwt.sign({ user : myuser },'ssi2020');

            // open wallet
            await indy.wallet.open(username+'_wallet', password);
            console.log('wallet open')

            let dids = await sdk.listMyDidsWithMeta(await indy.wallet.get());
            
            dids = await Promise.all(dids.map(async (did) => {    
              let getDidResponse = await indy.did.getNym(did.did);
              let didInfo = JSON.parse(getDidResponse.result.data) 
          
              console.log(didInfo)
          
              did.role = (didInfo ? didInfo.role : "no role");
          
              return did;
            }))  
          

            res.cookie('token', token, { httpOnly: true }).status(200).send({token: token, dids: dids});
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
  req.session.token = null

  return res.status(200).send()
})



// Prevent an authenticated user from accessing login or 
// register while authenticated
function checkNotAuthenticated(req, res, next) {
  const token = req.session.token
  if(!token) return next();
  else{
    try {
      jwt.verify(token, 'ssi2020');
      res.redirect('/dashboard');
    } catch (err) {
      return next();
    }
  }
}

module.exports = router;


