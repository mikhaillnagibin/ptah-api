'use strict';

const Router = require('koa-router');
const convert = require('koa-convert');
const KoaBody = require('koa-body');
const passport = require('koa-passport');

const config = require('../../config/config');
const {AUTHENTICATION_ERROR, CANT_CREATE_SESSION, INTERNAL_SERVER_ERROR, SIGNUP_CANT_CREATE_USER} = require('../../config/errors');
const Factory = require('../classes/factory');
const {REGISTRATION_SOURCE_MAILCHIMP} = require('./../classes/user.class');
const generatePassword = require('../utils/password').generatePassword;


const preventRedirect = async function (ctx, next, scope,  skipAuthCheck) {

    if (!skipAuthCheck && ctx.user && ctx.user.User) {
        // user already logged in
        // skip is for only mailchimp integration (not auth!) start
        return ctx.throw(412, PRECONDITION_FAILED);
    }

    scope = scope || '';
    let url = ctx.response.get('location');
    if (scope) {
        url += '&scope=' + scope;
    }
    ctx.body = {redirect:  url};
    ctx.status = 200;
    ctx.response.remove('location');
    next();
};

const createSession = async function (ctx, next) {
    if (ctx.user && ctx.user.User) {
        // user already logged in
        return ctx.throw(412, PRECONDITION_FAILED);
    }

    if (!(ctx.state && ctx.state.user)) {
        // user profile not received from oauth2 source
        return ctx.throw(401, AUTHENTICATION_ERROR)
    }

    const socialUser = ctx.state.user;

    try {
        const user = Factory.User(ctx);

        if (!await user.FindByEmail(socialUser.email)) {

            const password = generatePassword();

            const res = await user.CreateUser(socialUser.name, socialUser.email, password, socialUser.source);
            if (!res) {
                return ctx.throw(500, SIGNUP_CANT_CREATE_USER)
            }

            try {
                const mail = Factory.Mail(ctx);
                await mail.SendUserSignupSocial(user.GetUser(), password);
            } catch (e) {
                // do nothing
            }
        }

        if (socialUser.source === REGISTRATION_SOURCE_MAILCHIMP && socialUser.accessToken) {
            await user.EnableMailchimpIntegration(socialUser.accessToken);
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

const router = new Router({
    prefix: config.routesPrefix
});
const koaBody = convert(KoaBody({
    multipart: true
}));

const authRoutesNamespace = config.authRoutesNamespace;
const landingsRoutesNamespace = config.landingsRoutesNamespace;
const mailchimpRoutesNamespace = config.mailchimpRoutesNamespace;
const userRoutesNamespace = config.userRoutesNamespace;

router
    .get('/_healthz', async(ctx, next) => {
        try {
            // Use the admin database for the operation
            const adminDb = ctx.mongo.admin();
            await adminDb.ping();
            ctx.body = {};
            next();
        } catch (e) {
            return ctx.throw(500, INTERNAL_SERVER_ERROR)
        }
    })

    .post(`${authRoutesNamespace}/signup`, koaBody, require('../actions/auth/signup-local'))
    .post(`${authRoutesNamespace}/login`, koaBody, require('../actions/auth/login-local'))
    .post(`${authRoutesNamespace}/refresh`, koaBody, require('../actions/auth/refresh-token'))
    .post(`${authRoutesNamespace}/confirm_email`, koaBody, require('../actions/auth/confirm-email'))
    .post(`${authRoutesNamespace}/restore_password_step1`, koaBody, require('../actions/auth/restore-password-step1'))
    .post(`${authRoutesNamespace}/restore_password_step2`, koaBody, require('../actions/auth/restore-password-step2'))
    .get(`${authRoutesNamespace}/logout`, require('../actions/auth/logout'))

    .get(`${landingsRoutesNamespace}/`, require('../actions/landings/list-landings'))
    .post(`${landingsRoutesNamespace}/`, koaBody, require('../actions/landings/add-landing'))
    .post(`${landingsRoutesNamespace}/copy`, koaBody, require('../actions/landings/copy-landings'))
    .get(`${landingsRoutesNamespace}/:id`, require('../actions/landings/get-landing'))
    .patch(`${landingsRoutesNamespace}/:id`, koaBody, require('../actions/landings/update-landing'))
    .delete(`${landingsRoutesNamespace}/:id`, require('../actions/landings/delete-landing'))
    .post(`${landingsRoutesNamespace}/:id/publishing`, koaBody, require('../actions/landings/publish-landing'))
    .delete(`${landingsRoutesNamespace}/:id/publishing`, require('../actions/landings/unpublish-landing'))
    .post(`${landingsRoutesNamespace}/:id/domain`, koaBody, require('../actions/landings/set-landing-domain'))
    .delete(`${landingsRoutesNamespace}/:id/domain`, require('../actions/landings/unset-landing-domain'))

    .get(`${userRoutesNamespace}/`, require('../actions/user/get-user-info'))
    .post(`${userRoutesNamespace}/`, koaBody, require('../actions/user/update-user-info'))
    .post(`${userRoutesNamespace}/password`, koaBody, require('../actions/user/update-user-password'))
    .delete(`${userRoutesNamespace}/mailchimp`, require('../actions/user/disable-user-mailchimp-intergration'))
    .get(`${userRoutesNamespace}/send_email_confirmation`, require('../actions/user/send-email-confirmation'))

    // Mailchimp authentication route
    .get(`${mailchimpRoutesNamespace}/login`,
        passport.authenticate('mailchimp', {session: false, preventRedirect: true}),
        async (ctx, next) => {
            ctx.socialAuth = REGISTRATION_SOURCE_MAILCHIMP;
            return await preventRedirect(ctx, next, skipAuthCheck)
        },
    )
    // Mailchimp authentication callback
    .get(
        `${mailchimpRoutesNamespace}/login/callback`,
        passport.authenticate('mailchimp', {session: false, preventRedirect: true}),
        async (ctx, next) => {
            if (!(ctx.state && ctx.state.user && ctx.state.user.accessToken)) {
                return ctx.throw(412, PRECONDITION_FAILED);
            }
            const socialUser = ctx.state.user;
            if (!(ctx.user && ctx.user.User)) {
                return ctx.throw(412, PRECONDITION_FAILED);
            }
            await ctx.user.User.EnableMailchimpIntegration(socialUser.accessToken);
            ctx.status = 201;
            ctx.body = ctx.user.User.GetUser();
            next();
        },
    )
    .get(`${mailchimpRoutesNamespace}/maillists`, require('../actions/mailchimp/get-maillists'))
;


// Google authentication route
router
    .get(`${authRoutesNamespace}/google`,
        passport.authenticate('google', {session: false, preventRedirect: true}),
        async (ctx, next) => {
            return await preventRedirect(ctx, next, 'profile%20email')
        })
    .get(
        `${authRoutesNamespace}/google/callback`,
        passport.authenticate('google', {session: false, preventRedirect: true}),
        createSession
    );


// Mailchimp authentication route
router
    .get(`${authRoutesNamespace}/mailchimp`,
        passport.authenticate('mailchimp', {session: false, preventRedirect: true}),
        preventRedirect,
    )
    .get(
        `${authRoutesNamespace}/mailchimp/callback`,
        passport.authenticate('mailchimp', {session: false, preventRedirect: true}),
        createSession
    );


module.exports = {
    routes: () => router.routes(),
    allowedMethods: () => router.allowedMethods()
}
