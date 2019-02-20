'use strict';

const unless = require('koa-unless');
const tokenIntrospection = require('token-introspection');

const config = require('../../config/config');
const RedisOauthCache = require('./redis-oauth-cache');

let redisOauthCache = null;
if (config.redisPort && config.redisHost) {
    redisOauthCache = new RedisOauthCache(config.redisPort, config.redisHost, config.auth1CacheMaxAge);
}

function resolveAuthorizationHeader(ctx, opts) {
    if (!ctx.header || !ctx.header.authorization) {
        return;
    }

    const parts = ctx.header.authorization.split(' ');

    if (parts.length === 2) {
        const scheme = parts[0];
        const credentials = parts[1];

        if (/^Bearer$/i.test(scheme)) {
            return credentials;
        }
    }
    if (!opts.passthrough) {
        ctx.throw(401, 'Bad Authorization header format. Format is "Authorization: Bearer <token>"');
    }
}

module.exports = (opts = {}) => {
    const endpoint = opts.endpoint;
    const client_id = opts.client_id;
    const debug = !!opts.debug;
    const passthrough = !!opts.passthrough;
    let originalError = null;
    const tokenIntrospect = tokenIntrospection({
        endpoint: endpoint,
        client_id: client_id,
    });

    const middleware = async function jwt(ctx, next) {
        ctx.state.oauth2 = {
            invalid: true,
            reason: 'initial'
        };

        let token = resolveAuthorizationHeader(ctx, opts);
        if (!token) {
            ctx.throw(401, debug ? 'Token not found' : 'Authentication Error');
        }

        let inCache = null;

        if (redisOauthCache) {
            try {
                inCache = await redisOauthCache.get(token, ctx);
            } catch (e) {
            }
        }

        if (inCache) {
            ctx.state.oauth2 = inCache;
        } else {
            try {
                const result = await tokenIntrospect(token);
                ctx.state.oauth2 = result;
                ctx.state.oauth2.invalid = false;
                ctx.state.oauth2.reason = '';

                if (!result.active) {
                    ctx.state.oauth2.invalid = true;
                    ctx.state.oauth2.reason = 'Token not active';
                }

                if (result.token_type !== 'access_token') {
                    ctx.state.oauth2.invalid = true;
                    ctx.state.oauth2.reason = 'Token type invalid';
                }

                if (client_id && result.client_id !== client_id) {
                    ctx.state.oauth2.invalid = true;
                    ctx.state.oauth2.reason = 'Client_id invalid';
                }

            } catch (e) {
                ctx.state.oauth2.invalid = true;
                ctx.state.oauth2.reason = e.message;
                originalError = e;
            }

            if (redisOauthCache) {
                redisOauthCache.set(token, ctx.state.oauth2, ctx);
            }
        }

        if (ctx.state.oauth2.invalid && !passthrough) {
            const options = {};
            if (originalError) {
                options.originalError = originalError
            }
            ctx.throw(401, debug ? ctx.state.oauth2.reason : 'Authentication Error', options);
        }
        return next();
    };

    middleware.unless = unless;
    return middleware;
};
