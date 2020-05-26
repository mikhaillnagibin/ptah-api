'use strict';

const {AUTHENTICATION_ERROR} = require('../../../config/errors');

module.exports = async (ctx, next) => {
    try {
        const user = ctx.user.User;
        if (!user) {
            return ctx.throw(401, AUTHENTICATION_ERROR);
        }

        const token = user.GetConfirmEmailToken();

        const mail = Factory.Mail(ctx);
        mail.SendEmailConfirmation(user.GetUser(), token);

        ctx.status = 201;

    } catch (err) {
        throw err
    }
    next();
};
