'use strict';

const Koa = require('koa');
const Router = require('koa-router');
const convert = require('koa-convert');
const KoaBody = require('koa-body');
const urlParse = require('url-parse');

const config = require('../../config/config');
const fakes = require('./fakes');

const port = process.env.MOCK_SERVER_PORT || 3002;
const introspectionParsedUrl = urlParse(config.auth1IntrospectionUrl);
const mailchimpParsedUrl = urlParse(config.mailchimpMetadataUrl);

const koaBody = convert(KoaBody({
    urlencoded: true
}));

const error401Body = {
    error: {
        code: 401,
        message: 'Authentication Error'
    }
};

const logPrefix = 'MOCK SERVER';


const router = new Router();
router
    .post(introspectionParsedUrl.pathname, koaBody, async (ctx, next) => {
        console.log(logPrefix, 'Start request', 'POST', introspectionParsedUrl.pathname);
        const token = ctx.request.body.token || '';
        if (!token) {
            ctx.body = error401Body;
            ctx.status = 401;
            console.log(logPrefix, 'Finish request', 'POST', introspectionParsedUrl.pathname, ctx.status, ctx.body);
            return next();
        }

        const isActive = token === fakes.fakeUserAuthToken || token === fakes.fakeAnotherUserAuthToken;
        ctx.body = {
            active: isActive
        };

        if (isActive) {
            ctx.body.sub = token === fakes.fakeUserAuthToken ? fakes.fakeUserId : fakes.fakeAnotherUserId;
            ctx.body.client_id = config.auth1ClientId;
            ctx.body.token_type = 'access_token';
        }
        console.log(logPrefix, 'Finish request', 'POST', introspectionParsedUrl.pathname, ctx.status, ctx.body);
    })

    .get(mailchimpParsedUrl.pathname, async (ctx) => {
        console.log(logPrefix, 'Start request', 'GET', mailchimpParsedUrl.pathname);
        ctx.body = {
            api_endpoint: 'http://localhost:' + port
        };
        console.log(logPrefix, 'Finish request', 'GET', mailchimpParsedUrl.pathname, ctx.status, ctx.body);
    })

    .get(config.mailchimpMaillistsPath, async (ctx) => {
        console.log(logPrefix, 'Start request', 'GET', config.mailchimpMaillistsPath.pathname);
        ctx.body = fakes.fakeMaillistData;
        console.log(logPrefix, 'Finish request', 'GET', mailchimpParsedUrl.pathname, ctx.status, '---hidden---');
    })
;

const app = new Koa();
app.use(router.routes());
app.use(router.allowedMethods());

const server = app.listen(port, () => {
    console.log(`Mock server listening on port: ${port}`)
});

module.exports = server;