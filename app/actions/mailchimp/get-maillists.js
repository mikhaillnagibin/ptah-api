'use strict';

const urlJoin = require('url-join');

const {AUTHENTICATION_ERROR, PRECONDITION_FAILED} = require('../../../config/errors');

const config = require('../../../config/config');

const mailchimpRequest = require('../../services/mailchimp');

module.exports = async (ctx, next) => {
    try {
        const user = ctx.user.User;
        if (!user) {
            return ctx.throw(401, AUTHENTICATION_ERROR);
        }

        const token = user.GetMailchimpIntegrationToken();
        if (!token) {
            return ctx.throw(412, PRECONDITION_FAILED);
        }

        const options = {
            method: 'get',
            uri: config.mailchimpMetadataUrl,
            json: true,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        const metadata = await mailchimpRequest(ctx, options);

        options.uri = urlJoin([metadata.api_endpoint, config.mailchimpMaillistsPath]);

        ctx.body = await mailchimpRequest(ctx, options);

    } catch (err) {
        throw err
    }
    next();
};
