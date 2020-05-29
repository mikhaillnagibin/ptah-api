'use strict';

const {AUTHENTICATION_ERROR, USER_PASSWORD_IS_REQUIRED, USER_WEAK_PASSWORD} = require('../../../config/errors');

const checkPasswordStrength = require('../../utils/password').checkPasswordStrength;

module.exports = async (ctx, next) => {
    try {
        const user = ctx.user.User;
        if (!user) {
            return ctx.throw(401, AUTHENTICATION_ERROR);
        }

        const oldPassword = ctx.request.body.oldPassword || '';
        const password = ctx.request.body.password || '';

        if (!oldPassword) {
            return ctx.throw(400, USER_PASSWORD_IS_REQUIRED);
        }

        if (!password) {
            return ctx.throw(400, USER_PASSWORD_IS_REQUIRED);
        }

        if (!checkPasswordStrength(password)) {
            return ctx.throw(400, USER_WEAK_PASSWORD);
        }

        if (!await user.CheckUserPassword(oldPassword)) {
            return ctx.throw(401, AUTHENTICATION_ERROR);
        }

        await user.SetNewPassword(oldPassword, password);

        ctx.status = 204;
        ctx.body = user.GetUser();

    } catch (err) {
        throw err
    }
    next();
};
