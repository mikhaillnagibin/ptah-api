'use strict';

const fs = require('fs');
const os = require('os');
const Koa = require('koa');
const cors = require('koa2-cors');
const Sentry = require('@sentry/node');
const {KoaReqLogger} = require('koa-req-logger');
const cacheControl = require('koa-cache-control');

const config = require('../config/config');

const router = require('./middleware/router');
const mongo = require('./middleware/mongo');
const oauth2Introspection = require("./middleware/ouath2-introspection");


Sentry.init({
    dsn: config.sentryDsn,
    serverName: `${os.hostname()}-${process.env.NODE_ENV}`
});

const app = new Koa();
app.on('error', err => {
    Sentry.captureException(err);
});
// logger and errors handler
const logger = new KoaReqLogger({
    alwaysError: true // treat all non-2** http codes as error records in logs
});
app.use(logger.getMiddleware());

// healthCheck page not requires authorization or cors origin header check
const publicRoutes = {
    path: `${config.routesPrefix}/_healthz`
};

// CORS setup
app.use(cors({
    origin: function(ctx) {
        if (publicRoutes.path === ctx.url) {
            return false;
        }
        if (config.corsValidOrigins.includes('*')) {
            return '*';
        }
        const requestOrigin = ctx.accept.headers.origin;
        if (!config.corsValidOrigins.includes(requestOrigin)) {
            return ctx.throw(`${requestOrigin} is not a valid origin`);
        }
        return requestOrigin;
    },
    allowMethods: router.allowedMethods(),
    maxAge: 5,
    credentials: false,
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

// ensure that dirs are exists
fs.mkdirSync(config.publicHtmlDir, { recursive: true });
fs.mkdirSync(config.nginxConfigsDir, { recursive: true });

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

// handle mongoDb connection error with code 500 instead of 200 by default, and crash the app after send answer
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        if (~err.name.toLowerCase().indexOf('mongo')) {
            ctx.res.once('finish', function (){
                process.exit(1);
            });
        }
        err.status = err.status || 500;
        throw err;
    }
});

app.use(mongo(mongoOptions, mongoConnectionOptions));

// Middleware below this block is only reached if access token is valid
const introspectionOptions = {
    endpoint: config.auth1IntrospectionUrl,
    client_ids: config.auth1ClientId,
    debug: false
};
app.use(oauth2Introspection(introspectionOptions).unless(publicRoutes));

app.use(router.routes());
app.use(router.allowedMethods());

app.use(cacheControl({
    noCache: true
}));

// server
const port = config.serverPort;
const server = app.listen(port, () => {
    console.log(`Server listening on port: ${port}`)
});

module.exports = server;
