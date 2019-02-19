'use strict';

const urlJoin =  require('url-join');

const config = require('../../config/config');
const getUser = require('./helpers/get-user');

module.exports = async (ctx, next) => {
    try {
        const user = await getUser(ctx);

        if (!(user.mailchimpIntegration && user.mailchimpAccessToken)) {
            const err = new Error('Precondition failed');
            err.status = 412;
            throw err;
        }

        const metadata = await ctx.get(config.mailchimpMetadataUrl, null, {
            'Authorization': `Bearer ${user.mailchimpAccessToken}`
        });

        const apiEndpoint = metadata.api_endpoint;

        const listsUrl = urlJoin([apiEndpoint, config.mailchimpMaillistsPath]);

        ctx.body = await ctx.get(listsUrl, null, {
            'Authorization': `Bearer ${user.mailchimpAccessToken}`
        });

    } catch (err) {
        throw err
    }
    next();
};
