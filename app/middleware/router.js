'use strict';

const Router  = require('koa-router');
const convert = require('koa-convert');
const KoaBody = require('koa-body');

const router = new Router();
const koaBody = convert(KoaBody());

router
    .get('/', async (ctx) => {
        ctx.body = ctx.state.user;
    })

module.exports.routes = function () { return router.routes() };
module.exports.allowedMethods = function () { return router.allowedMethods() };
