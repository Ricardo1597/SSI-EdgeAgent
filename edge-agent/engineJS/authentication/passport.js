///////////////////////////////////////////////////////////////
////////////| Autentication with passport and jwt |////////////
///////////////////////////////////////////////////////////////


var passport = require('passport')
var localStrategy = require('passport-local').Strategy
var UserModel = require('../models/users')


// LOGIN
passport.use('login', new localStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, async (username, password, done) => {
    console.log(username)
    console.log(password)
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
}))


// JWT Authentication
var JWTStrategy = require('passport-jwt').Strategy
var ExtractJWT = require('passport-jwt').ExtractJwt

passport.use('jwt', new JWTStrategy({
    secretOrKey : "ssi2020",
    jwtFromRequest : ExtractJWT.fromAuthHeaderAsBearerToken()
    }, (jwt_payload, done) => {
        UserModel.findOne({id: jwt_payload.sub}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
                // or you could create a new account
            }
        });
}));






passport.serializeUser((user, done) => {
    done(null, user.id);
});
  

passport.deserializeUser((id, done) => {
    UserModel.findById(id, (err, user) => {
        done(err, user);
    });
});

