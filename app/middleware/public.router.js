'use strict';

const Router  = require('koa-router');

const config = require('../../config/config');

const auth1Middleware = require('./auth1.oauth2');

const router = new Router({
    prefix: config.routesPrefix
});


const auth1Namespace = config.auth1Namespace;

router
    .get('/_healthz', async(ctx, next) => {
        ctx.body = {};
        next();
    })

    .get(`${auth1Namespace}/login`, auth1Middleware.login)
    .get(`${auth1Namespace}/callback`, auth1Middleware.authorized)
    .get(`${auth1Namespace}/refresh`, auth1Middleware.refresh)
    .get(`${auth1Namespace}/logout`, auth1Middleware.logout)
;

module.exports.routes = function () { return router.routes() };
module.exports.allowedMethods = function () { return router.allowedMethods() };
