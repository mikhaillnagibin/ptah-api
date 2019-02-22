'use strict';
const _ = require('lodash');
const ObjectID = require('bson-objectid');

const getUser = require('./helpers/get-user');
const badRequest = require('./helpers/bad-request');
const getDbCollection = require('../utils/get-db-collection');

module.exports = async (ctx, next) => {
    try {
        const user = await getUser(ctx);

        if (user) {
            if (typeof ctx.request.body.mailchimpAccessToken === 'undefined') {
                return badRequest();
            }
            const mailchimpAccessToken = ctx.request.body.mailchimpAccessToken || '';

            user.mailchimpAccessToken = mailchimpAccessToken;
            user.mailchimpIntegration = !!mailchimpAccessToken;

            const collection = getDbCollection.users(ctx);
            await collection.updateOne({ _id: ObjectID(user._id) }, { $set: user })
        }
        ctx.status = 200;
        ctx.body = _.pick(user, ['userId', 'mailchimpIntegration'])
    } catch (err) {
        throw err
    }
    next();
};
