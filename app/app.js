'use strict'

const Koa = require('koa');
const jwt = require('koa-jwt');
const mongo = require('koa-mongo')
const {KoaReqLogger} = require('koa-req-logger');

const config = require('../config/config');

const router = require('./middleware/router');

const app = new Koa()

// logger and errors handler
const logger = new KoaReqLogger();
app.use(logger.getMiddleware());

// setup db connection
const mongoOptions = {
    host: config.dbHost,
    port: config.dbPort,
    user: config.dbUser,
    pass: config.dbPass,
    db: config.dbName,
    min: config.dbPoolMin,
    max: config.dbPoolMax,
};
app.use(mongo(mongoOptions));

// Middleware below this line is only reached if JWT token is valid
app.use(jwt({ secret: config.jwtKey }));

app.use(router.routes())
app.use(router.allowedMethods())

const port = config.serverPort

// server
const server = app.listen(port, () => {
    console.log(`Server listening on port: ${port}`)
})

module.exports = server
