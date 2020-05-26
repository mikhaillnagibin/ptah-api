"use strict";

const DSNParser = require('dsn-parser');
const passport = require('koa-passport');
const {MongoClient} = require('mongodb');

const config = require('../../config/config');
const Factory = require('./../classes/factory');
const generatePassword = require('../utils/password').generatePassword;
const {REGISTRATION_SOURCE_GOOGLE} = require('./../classes/user.class');
const defaultConnectionOptions = require('./mongo').defaultConnectionOptions;

const getMongoConnection = async function getMongoConnection() {
    try {
        return await MongoClient.connect(config.mongoDsn, defaultConnectionOptions);
    } catch (e) {
        throw e
    }
}

const getMongoDb = function (connection) {
    const dsn = new DSNParser(config.mongoDsn);
    const dbName = dsn.get('database');
    return connection.db(dbName);
}

async function getUser(req, name, email, source, done) {
    try {
        const connection = await getMongoConnection();
        if (!connection) {
            return done(null, false)
        }
        const db = getMongoDb(connection);
        const collectionUsers = db.collection(config.dbUsersCollectionName);

        const user = Factory.User(null, collectionUsers);

        if (!await user.FindByEmail(email)) {

            const password = generatePassword();

            const res = await user.CreateUser(name, email, password, source);

            if (!res) {
                connection.close()
                return done(null, false)
            }

            try {
                const mail = Factory.Mail(null);
                await mail.SendUserSignupSocial(user.GetUser(), password);
            } catch (e) {
                // do nothing
            }
        }

        connection.close()
        done(null, user.GetUser());
    } catch (e) {
        console.log(e);
        return done(null, false)
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
            await getUser(req, name, email, REGISTRATION_SOURCE_GOOGLE, done);

        } catch (e) {
            done(null, false)
        }
    }
));
