'use strict';

const {AUTHENTICATION_ERROR, MAILCHIMP_ACCESS_TOKEN_IS_REQUIRED_PARAM} = require('../../../config/errors');

module.exports = async (ctx, next) => {
    try {
        const user = ctx.user.User;
        if (!user) {
            return ctx.throw(401, AUTHENTICATION_ERROR);
        }

        const isPost = ctx.request.method === 'POST';

        let mailchimpAccessToken = '';

        if (isPost) {
            mailchimpAccessToken = ctx.request.body.mailchimpAccessToken || '';

            if (!mailchimpAccessToken) {
                return ctx.throw(400, MAILCHIMP_ACCESS_TOKEN_IS_REQUIRED_PARAM);
            }
        }

        isPost && mailchimpAccessToken !== ''
            ? await user.EnableMailchimpIntegration(mailchimpAccessToken)
            : await user.DisableMailchimpIntegration();

        ctx.status = 200;
        ctx.body = user.GetUser();

    } catch (err) {
        throw err
    }
    next();
};
