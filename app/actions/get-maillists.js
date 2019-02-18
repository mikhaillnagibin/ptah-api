'use strict';

const urlJoin =  require('url-join');
const ObjectID = require('bson-objectid');

const config = require('../../config/config');

const getUser = require('./helpers/get-user');
const getDbCollection = require('../utils/get-db-collection');

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
        const mailchimpUserId = metadata.user_id;

        if (!user.mailchimpUserId) {
            user.mailchimpUserId = mailchimpUserId;
            const collection = getDbCollection.users(ctx);
            await collection.updateOne({ _id: ObjectID(user._id) }, { $set: user })
        }

        const listsUrl = urlJoin([apiEndpoint, config.mailchimpMaillistsPath]);

        const maillists = await ctx.get(listsUrl, null, {
            'Authorization': `Bearer ${user.mailchimpAccessToken}`
        });

        maillists.user_id = mailchimpUserId;

        ctx.body = maillists;


    } catch (err) {
        throw err
    }
    next();
};
