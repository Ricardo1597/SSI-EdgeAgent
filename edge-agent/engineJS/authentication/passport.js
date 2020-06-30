///////////////////////////////////////////////////////////////
////////////| Autentication with passport and jwt |////////////
///////////////////////////////////////////////////////////////


var passport = require('passport')
var localStrategy = require('passport-local').Strategy
var UserModel = require('../models/users')
const indy = require('../indy/index')
const config = require('../config')
require('dotenv/config')
const { getRefreshTokenVersion } = require('./refreshToken')

// LOGIN
passport.use('login', new localStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, async (username, password, done) => {
    try {            
        // Try to open wallet
        const walletHandle = await indy.wallet.open(username+'_wallet', password);
        console.log('wallet open');
        return done(null, {walletHandle: walletHandle, username: username}, {message: 'you are now logged in.'});
    } catch(error) {
        if(error.indyCode === 206){ // WalletAlreadyOpenedError
            return done(null, {walletHandle: await indy.wallet.get(), username: username}, {message: 'you are now logged in.'});
        } 
        if(error.indyCode === 207){
            return done(null, false, {message: 'Invalid credentials.'});
        } 
        return done(error);
    }
    /*
    UserModel.findOne({username: username})
        .then(user => {
            if(!user) 
                return done(null, false, {message: 'Incorrect username.'})

            // Match password
            user.isValidPassword(password)
            .then( valid => {
                if(!valid)
                    return done(null, false, {message: 'Incorrect password.'})

                return done(null, user, {message: 'you are now logged in.'})
            })
            .catch(error => done(error));
        })
        .catch(error => done(error));
    */
}))



// JWT Authentication
var JWTStrategy = require('passport-jwt').Strategy
var ExtractJWT = require('passport-jwt').ExtractJwt

passport.use('jwt', new JWTStrategy({
    secretOrKey : process.env.ACCESS_TOKEN_SECRET,
    jwtFromRequest : ExtractJWT.fromAuthHeaderAsBearerToken()
}, async (jwt_payload, done) => {      
    console.log("Access token: ", jwt_payload)
    if(!jwt_payload.user) {
        return done(null, false);
    }
    const { walletHandle } = jwt_payload.user;
    if (walletHandle && walletHandle == await indy.wallet.get()) {
        return done(null, jwt_payload.user);
    } else {
        return done(null, false);
    }
}));



// Validate refresh jwt token to create a new jwt access token
const cookieExtractor = (req) => {
    var token = null;
    if (req && req.cookies) {
        token = req.cookies['refreshToken' + config.adminPort];
    } else {
        console.log('Cookie extractor: no cookie found');
    }
    return token;
};

passport.use('refresh', new JWTStrategy({
    secretOrKey : process.env.REFRESH_TOKEN_SECRET,
    jwtFromRequest : cookieExtractor
}, async (jwt_payload, done) => {    
    console.log("Refresh token: ", jwt_payload)
    if(!jwt_payload.user) {
        return done(null, false);
    }
    const { username, walletHandle } = jwt_payload.user;
    const tokenVersion = getRefreshTokenVersion(username);
    if (walletHandle && walletHandle == await indy.wallet.get() &&
        jwt_payload.version == tokenVersion) {
        return done(null, jwt_payload.user);
    } else {
        return done(null, false);
    }
}));
