'use strict';

const isAsciiEmail = require('sane-email-validation').isAsciiEmail

const {SIGNUP_NAME_IS_REQUIRED, SIGNUP_INVALID_EMAIL, SIGNUP_EMAIL_CANNOT_BE_USED, SIGNUP_WEAK_PASSWORD,
    SIGNUP_CANT_CREATE_USER } = require('../../../config/errors');

const checkPasswordStrength = require('../../utils/password').checkPasswordStrength;

const {REGISTRATION_SOURCE_LOCAL} = require('../../classes/user.class');
const Factory = require('../../classes/factory');

module.exports = async (ctx, next) => {
    try {
        const name = ctx.request.body.name || '';
        const email = ctx.request.body.email || '';
        const password = ctx.request.body.password || '';

        if (!name) {
            return ctx.throw(400, SIGNUP_NAME_IS_REQUIRED);
        }

        if (!isAsciiEmail(email)) {
            return ctx.throw(400, SIGNUP_INVALID_EMAIL);
        }

        const user = Factory.User(ctx);

        if (await user.FindByEmail(email)) {
            return ctx.throw(400, SIGNUP_EMAIL_CANNOT_BE_USED);
        }

        if (!checkPasswordStrength(password)) {
            return ctx.throw(400, SIGNUP_WEAK_PASSWORD);
        }

        const createdUser = await user.CreateUser(name, email, password, REGISTRATION_SOURCE_LOCAL);

        if (!createdUser) {
            return ctx.throw(500, SIGNUP_CANT_CREATE_USER);
        }

        const us = Factory.UserSession(ctx);

        const s = await us.Create(user.GetId(), ctx.request.ip, ctx.request.header['user-agent']);

        if (!s) {
            return ctx.throw(500, CANT_CREATE_SESSION)
        }

        ctx.status = 201;
        ctx.body = s;

        try {
            const token = user.GetConfirmEmailToken();
            const mail = Factory.Mail(ctx);
            mail.SendUserSignupLocal(user.GetUser(), token);
        } catch (e) {
            ctx.log.warn(e);
        }

    } catch (err) {
        return ctx.throw(err.status || 500, err.message)
    }

    next();

};
