'use strict';

const {TOKEN_IS_REQUIRED, NOT_FOUND} = require('../../../config/errors');
const Factory = require('../../classes/factory');

module.exports = async (ctx, next) => {
    try {
        const token = ctx.request.body.token || '';

        if (!token) {
            return ctx.throw(400, TOKEN_IS_REQUIRED);
        }

        const user = Factory.User(ctx);

        if (!await user.FindByConfirmEmailToken(token)) {
            return ctx.throw(404, NOT_FOUND);
        }

        await user.SetEmailConfirmed();

        ctx.status = 200;
        ctx.body = user.GetUser();

    } catch (err) {
        return ctx.throw(err.status || 500, err.message)
    }

    next();

};
