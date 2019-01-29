'use strict';

const fs = require('fs');
const Koa = require('koa');
const jwt = require('koa-jwt');
const mongo = require('koa-mongo-driver');
const {KoaReqLogger} = require('koa-req-logger');
const cacheControl = require('koa-cache-control');

const config = require('../config/config');

const router = require('./middleware/router');

const app = new Koa();

// setup db connection
const mongoOptions = {
    host: config.dbHost,
    port: config.dbPort,
    db: config.dbName,
};
const mongoConnectionOptions = {};
if (config.dbUser && config.dbPass && config.dbAuthMethod) {
    mongoConnectionOptions.auth = {
        user: config.dbUser,
        password: config.dbPass
    };
    mongoConnectionOptions.authSource = config.dbName;
    mongoConnectionOptions.authMechanism = config.dbAuthMethod;
}

// handle mongoDb connection error with code 500 instead of 200 by default
app.use(async (ctx, next) => {
    try {
        await next();
        if(ctx.body && ctx.body.success === false) {
            const err = new Error('Internal Server Error');
            err.status = 500;
            throw err;
        }
    } catch (err) {
        throw err;
    }
});

app.use(mongo(mongoOptions, mongoConnectionOptions));

// logger and errors handler
const logger = new KoaReqLogger({
    alwaysError: true // treat all non-2** http codes as error records in logs
});
app.use(logger.getMiddleware());

// Middleware below this line is only reached if JWT token is valid
app.use(jwt({ secret: config.jwtKey }));

app.use(router.routes());
app.use(router.allowedMethods());

app.use(cacheControl({
    noCache: true
}));

// ensure that dirs are exists
fs.mkdirSync(config.publicHtmlDir, { recursive: true });
fs.mkdirSync(config.nginxConfigsDir, { recursive: true });

// server
const port = config.serverPort;
const server = app.listen(port, () => {
    console.log(`Server listening on port: ${port}`)
});

module.exports = server;
