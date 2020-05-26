'use strict';

const {EMAIL_IS_REQUIRED, NOT_FOUND} = require('../../../config/errors');
const Factory = require('../../classes/factory');

module.exports = async (ctx, next) => {
    try {
        const email = ctx.request.body.email || '';

        if (!email) {
            return ctx.throw(400, EMAIL_IS_REQUIRED);
        }

        const user = Factory.User(ctx);

        if (!await user.FindByEmail(email)) {
            return ctx.throw(404, NOT_FOUND);
        }

        const token = user.GetRestorePasswordToken();

        const mail = Factory.Mail(ctx);
        mail.SendRestorePasswordRequest(user.GetUser(), token);

        ctx.status = 201;

    } catch (err) {
        return ctx.throw(err.status || 500, err.message)
    }

    next();

};
