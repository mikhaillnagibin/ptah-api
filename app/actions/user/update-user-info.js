'use strict';

const {AUTHENTICATION_ERROR, USER_NAME_IS_REQUIRED} = require('../../../config/errors');

module.exports = async (ctx, next) => {
    try {
        const user = ctx.user.User;
        if (!user) {
            return ctx.throw(401, AUTHENTICATION_ERROR);
        }

        const name = ctx.request.body.name || '';

        if (!name) {
            return ctx.throw(400, USER_NAME_IS_REQUIRED);
        }

        await user.ChangeName(name);

        ctx.status = 200;
        ctx.body = user.GetUser();

    } catch (err) {
        throw err
    }
    next();
};
