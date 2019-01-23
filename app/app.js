'use strict'

const Koa = require('koa');
const {KoaReqLogger} = require('koa-req-logger');

const config = require('../config/config');

const router = require('./middleware/router');

const app = new Koa()

// logger and errors handler
const logger = new KoaReqLogger();
app.use(logger.getMiddleware());

app.use(router.routes())
app.use(router.allowedMethods())

const port = config.serverPort

// server
const server = app.listen(port, () => {
    console.log(`Server listening on port: ${port}`)
})

module.exports = server
