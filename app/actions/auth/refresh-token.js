'use strict';

const {FORBIDDEN, CANT_CREATE_SESSION} = require('../../../config/errors');

const Factory = require('../../classes/factory');

module.exports = async (ctx, next) => {
    try {
        const token = ctx.request.body.refreshToken || '';

        const us = Factory.UserSession(ctx);

        const session = await us.FindByRefreshToken(token, ctx.request.ip, ctx.request.header['user-agent']);

        if (!session) {
            return ctx.throw(403, FORBIDDEN);
        }

        const s = await us.Refresh(session.userId, ctx.request.ip, ctx.request.header['user-agent']);

        if (!s) {
            return ctx.throw(500, CANT_CREATE_SESSION);
        }

        ctx.status = 200;
        ctx.body = s;

    } catch (err) {
        return ctx.throw(err.status || 500, err.message)
    }

    next();

};
