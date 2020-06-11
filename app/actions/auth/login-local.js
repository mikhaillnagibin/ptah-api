'use strict';

const {LOGIN_EMAIL_AND_PASSWORD_REQUIRED, FORBIDDEN, CANT_CREATE_SESSION} = require('../../../config/errors');

const Factory = require('../../classes/factory');

module.exports = async (ctx, next) => {
    try {
        const email = ctx.request.body.email || '';
        const password = ctx.request.body.password || '';

        if (!email || !password) {
            return ctx.throw(400, LOGIN_EMAIL_AND_PASSWORD_REQUIRED);
        }

        const user = Factory.User(ctx);

        if (!await user.FindByEmail(email)) {
            return ctx.throw(403, FORBIDDEN);
        }

        if (!await user.CheckUserPassword(password)) {
            return ctx.throw(403, FORBIDDEN);
        }

        const us = Factory.UserSession(ctx);

        const s = await us.Create(user.GetId(), ctx.request.ip, ctx.request.header['user-agent']);

        if (!s) {
            return ctx.throw(500, CANT_CREATE_SESSION)
        }

        ctx.status = 200;
        ctx.body = s;

    } catch (err) {
        return ctx.throw(err.status || 500, err.message)
    }

    next();

};
