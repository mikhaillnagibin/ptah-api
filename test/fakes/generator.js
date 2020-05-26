'use strict';
const chai = require('chai')
const spies = require('chai-spies')
chai.use(spies)

const fs = require('fs');
const path = require('path');
const {v4: uuidv4} = require('uuid');
const DSNParser = require('dsn-parser');
const MongoClient = require('mongodb').MongoClient;

const config = require('./../../config/config');
const {User} = require('./../../app/classes/user.class');
const {UserSession} = require('./../../app/classes/user-session.class');
const generatePassword = require('./../../app/utils/password').generatePassword;


const getRequestId = () => Math.random().toString(36).substring(2) +
    Math.random().toString(36).substring(2)

const getRedirect = () => {
    function redirect() {
    }

    return chai.spy(redirect)
}

const getThrow = () => {
    return chai.spy(function () {
    })
}


const getFakeCtx = (session, query, header) => {
    return {
        id: getRequestId(),
        log: console,
        session: session || {},
        query: query || {},
        header: header || {},
        body: undefined,
        status: 200,
        redirect: getRedirect(),
        throw: getThrow()
    }
}

const dsn = new DSNParser(config.mongoDsn);
const dbName = dsn.get('database');

// Use connect method to connect to the server
MongoClient.connect(config.mongoDsn, {useUnifiedTopology: true}, async function (err, client) {
    if (err !== null) {
        console.error(err);
        client.close();
        process.exit(1);
    }

    const collectionUsers = client.db(dbName).collection(config.dbUsersCollectionName);
    const collectionUsersSessions = client.db(dbName).collection(config.dbUsersSessionsCollectionName);

    const fakeCtx = getFakeCtx();

    const paramsUser = {
        passwordSecret: '111',
        restorePasswordSecret: '111',
        restorePasswordLifetime: 1,
        confirmEmailSecret: '111',
        confirmEmailLifetime: 1,
    }

    const paramsUserSession = {
        authTokenSecret: config.authTokenSecret,
        accessTokenLifetime: config.accessTokenLifetime,
        refreshTokenLifetime: config.refreshTokenLifetime,
        authCheckUserAgent: config.authCheckUserAgent,
    }

    const result = [];

    let i = 0;
    try {
        for (const uuid of [uuidv4(), uuidv4()]) {
            const user = new User(fakeCtx, collectionUsers, paramsUser);
            await user.CreateUser(uuid, uuid + '@test.com', generatePassword(), 'unit-test');
            if (i) {
                user.EnableMailchimpIntegration(uuidv4());
            }

            const us = new UserSession(fakeCtx, collectionUsersSessions, paramsUserSession);

            const s = await us.Create(user.GetId(), '::ffff:127.0.0.1', '');

            result.push(Object.assign({}, user.GetUser(), s))

            i++;
        }
    } catch (e) {
        console.error(e);
        client.close();
        process.exit(1);
    }

    const filepath = path.resolve(__dirname, 'fake_users.json');
    fs.writeFileSync(filepath, JSON.stringify(result));

    client.close();
    process.exit(0);
});
