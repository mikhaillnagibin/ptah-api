'use strict';

const {TOKEN_IS_REQUIRED, NOT_FOUND} = require('../../../config/errors');
const generatePassword = require('../../utils/password').generatePassword;
const Factory = require('../../classes/factory');

module.exports = async (ctx, next) => {
    try {
        const token = ctx.request.body.token || '';

        if (!token) {
            return ctx.throw(400, TOKEN_IS_REQUIRED);
        }

        const user = Factory.User(ctx);

        if (!await user.FindByRestorePasswordToken(token)) {
            return ctx.throw(404, NOT_FOUND);
        }

        const newPassword = generatePassword();

        await user.SetNewPassword(newPassword);

        const mail = Factory.Mail(ctx);
        mail.SendRestorePassword(user.GetUser(), newPassword);

        ctx.status = 201;

    } catch (err) {
        return ctx.throw(err.status || 500, err.message)
    }

    next();

};
