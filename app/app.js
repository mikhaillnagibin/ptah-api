'use strict';

const fs = require('fs');
const os = require('os');
const Koa = require('koa');
const Redis = require('ioredis');
const pino = require('pino');
const cors = require('koa2-cors');
const unless = require('koa-unless');
const Sentry = require('@sentry/node');
const {KoaReqLogger, reqSerializer, resSerializer, errSerializer} = require('koa-req-logger');
const cacheControl = require('koa-cache-control');
const {JwtVerifier, StorageRedis, koaOauthMiddleware} = require('authone-jwt-verifier-node');

const config = require('../config/config');

const router = require('./middleware/router');
const mongo = require('./middleware/mongo');


Sentry.init({
    dsn: config.sentryDsn,
    serverName: `${os.hostname()}-${process.env.NODE_ENV}`
});

const app = new Koa();
app.on('error', err => {
    Sentry.captureException(err);
});
// logger and errors handler
const pinoLogger = pino({
    useLevelLabels: true,
    timestamp: pino.stdTimeFunctions.unixTime,
    serializers: {
        req: reqSerializer,
        res: resSerializer,
        err: errSerializer,
    },
});
const logger = new KoaReqLogger({
    pinoInstance: pinoLogger,
    alwaysError: true // treat all non-2** http codes as error records in logs
});
app.use(logger.getMiddleware());

// healthCheck page not requires authorization or cors origin header check
const publicRoutes = {
    path: `${config.routesPrefix}/_healthz`
};

// CORS setup
app.use(cors({
    origin: function (ctx) {
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
    maxAge: 5,
    credentials: false,
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

// ensure that dirs are exists
fs.mkdirSync(config.publicHtmlDir, {recursive: true});
fs.mkdirSync(config.nginxConfigsDir, {recursive: true});

// handle mongoDb connection error with code 500 instead of 200 by default, and crash the app after send answer
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        if (~err.name.toLowerCase().indexOf('mongo')) {
            ctx.res.once('finish', function () {
                process.exit(1);
            });
        }
        err.status = err.status || 500;
        throw err;
    }
});

app.use(mongo(config.mongoDsn, {}));

// Middleware below this block is only reached if access token is valid
const verifierOptions = {
    issuer: config.auth1Issuer,
    clientId: config.auth1ClientId,
    clientSecret: config.auth1ClientSecret,
    redirectUrl: ''
};
const namespace = 'auth1';
let storage = null;
if (config.redisHost && config.redisPort) {
    const redisInstance = new Redis(config.redisHost, config.redisPort);
    storage = new StorageRedis(redisInstance);
}
const jwtVerifier = new JwtVerifier(verifierOptions, storage);
const requestAuthenticator = koaOauthMiddleware.requestAuthenticator(jwtVerifier, namespace);
requestAuthenticator.unless = unless;
app.use(requestAuthenticator.unless(publicRoutes));

app.use(router.routes());
app.use(router.allowedMethods());

app.use(cacheControl({
    noCache: true
}));

// server
const port = config.serverPort;
const server = app.listen(port, () => {
    pinoLogger.info(`Server listening on port: ${port}`);
});

module.exports = server;
