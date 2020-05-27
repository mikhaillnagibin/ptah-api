'use strict';

const {AUTHENTICATION_ERROR} = require('../../../config/errors');

module.exports = async (ctx, next) => {
    try {
        const user = ctx.user.User;
        if (!user) {
            return ctx.throw(401, AUTHENTICATION_ERROR);
        }

        await user.DisableMailchimpIntegration();

        ctx.status = 200;
        ctx.body = user.GetUser();

    } catch (err) {
        throw err
    }
    next();
};
