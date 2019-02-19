'use strict';

const urlJoin = require('url-join');

const config = require('../../config/config');
const getUser = require('./helpers/get-user');
const mailchimpRequest = require('../services/mailchimp');

module.exports = async (ctx, next) => {
    try {
        const user = await getUser(ctx);

        if (!(user.mailchimpIntegration && user.mailchimpAccessToken)) {
            const err = new Error('Precondition failed');
            err.status = 412;
            throw err;
        }

        const options = {
            method: 'get',
            uri: config.mailchimpMetadataUrl,
            json: true,
            headers: {
                'Authorization': `Bearer ${user.mailchimpAccessToken}`
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
