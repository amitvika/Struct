const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');



module.exports = function(passport) {//whatever we export for authentication is a function that takes the parameter: passport
    passport.use(
        new localStrategy({usernameField: 'email'}, (email,password, done)=>{
            //first check if user is created already
            User.findOne({email:email})
                .then(user=>{
                    if(!user){
                        return done(null, false, {message:'Email not registered' });
                    }
                    //if user does exist, match the password with the user
                    bcrypt.compare(password, user.password, (err,isMatch)=>{
                        if(err) throw err;
                        if(isMatch){
                            return done(null,user);
                        }else{
                            return done(null,false,{message:'Password incorrect'});
                        }
                    })
                })
                .catch(err=>console.log(err));
            
        })
    );
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
}