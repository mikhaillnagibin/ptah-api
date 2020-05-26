'use strict'

const {AUTHENTICATION_ERROR} = require('../../config/errors');

const Factory = require('./../classes/factory');

module.exports.requestAuthenticator = () => {
    const getTokenFromHeader = (ctx) => {
        if (ctx.header && ctx.header.authorization) {
            const parts = ctx.header.authorization.split(' ')

            if (parts.length === 2) {
                const scheme = parts[0]
                const credentials = parts[1]

                if (/^Bearer$/i.test(scheme)) {
                    return credentials
                }
            }
        }
    }

    return async function (ctx, next) {
        try {
            const token = getTokenFromHeader(ctx)
            if (!token) {
                return ctx.throw(401, AUTHENTICATION_ERROR)
            }

            const us = Factory.UserSession(ctx);

            const session = await us.FindByAccessToken(token, ctx.request.ip, ctx.request.header['user-agent']);

            if (!session) {
                return ctx.throw(401, AUTHENTICATION_ERROR)
            }

            ctx.state = ctx.state || {}

            const user = Factory.User(ctx);
            ctx.state.user = await user.FindById(session.userId);

            if (!ctx.state.user) {
                return ctx.throw(401, AUTHENTICATION_ERROR)
            }

            ctx.user = ctx.user || {}
            ctx.user.User = user;
            ctx.user.Session = session;

            ctx.state.accessToken = token;

            return next()
        } catch (err) {
            ctx.throw(err.status || 500, err.message)
        }
    }
}
