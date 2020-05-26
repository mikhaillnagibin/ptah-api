"use strict";

const passport = require('koa-passport');

const config = require('../../config/config');
const {REGISTRATION_SOURCE_GOOGLE} = require('./../classes/user.class');

const getSocialUser = function(req, name, email, source) {
    return {
        req: req,
        email: email,
        name: name,
        source: source
    }
}

// google strategy of Passport.js
const GoogleStrategy = require('passport-google-oauth2').Strategy
passport.use(new GoogleStrategy({
        clientID: config.googleAuthClientId,
        clientSecret: config.googleAuthClientSecret,
        callbackURL: config.publicHost, // todo send callbackUrl with path
        passReqToCallback: true
    },
    async (req, token, tokenSecret, profile, done) => {
        try {
            const email = profile.emails[0].value;
            const name = profile.name.givenName + ' ' + profile.name.familyName;
            done(null, getSocialUser(req, name, email, REGISTRATION_SOURCE_GOOGLE));
        } catch (e) {
            done(null, false)
        }
    }
));
