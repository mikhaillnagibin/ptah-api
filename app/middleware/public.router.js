'use strict';

const Router  = require('koa-router');

const config = require('../../config/config');

const oauthMiddleware = require('./oauth2');

const router = new Router({
    prefix: config.routesPrefix
});


const authNamespace = config.authNamespace;

router
    .get('/_healthz', async(ctx, next) => {
        ctx.body = {};
        next();
    })

    .get(`${authNamespace}/login`, oauthMiddleware.login)
    .get(`${authNamespace}/callback`, oauthMiddleware.authorized)
    .get(`${authNamespace}/refresh`, oauthMiddleware.refresh)
    .get(`${authNamespace}/logout`, oauthMiddleware.logout)
;

module.exports.routes = function () { return router.routes() };
module.exports.allowedMethods = function () { return router.allowedMethods() };
