'use strict';

const Router  = require('koa-router');
const convert = require('koa-convert');
const KoaBody = require('koa-body');

const config = require('../../config/config');

const router = new Router();
const koaBody = convert(KoaBody());

router
    .get('/', async (ctx) => {
        const collection = ctx.db.collection(config.dbCollectionName);
        ctx.body = {};
        ctx.body.db = await collection.insertOne({ content: 'Just another object21.' });
        ctx.body.user = ctx.state.user;
    })

module.exports.routes = function () { return router.routes() };
module.exports.allowedMethods = function () { return router.allowedMethods() };
