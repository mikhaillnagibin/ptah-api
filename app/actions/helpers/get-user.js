'use strict';

const _ = require('lodash');
const ObjectID = require('bson-objectid');

const config = require('../../../config/config');
const getDbCollection = require('./../../utils/get-db-collection');

const omitFields = [];

module.exports = async (ctx) => {
    const userId = _.get(ctx, config.userIdStatePath);
    if (!userId) {
        const err = new Error('No authenticated user in state');
        ctx.log.error(err);
        throw err
    }

    const options = {
        projection: {}
    };
    omitFields.forEach((field) => {
        options.projection[field] = 0
    });

    const condition = {
        isDeleted: false,
        userId: userId
    };

    const collection = getDbCollection.users(ctx);

    let result = null;

    try {
        result = await collection.findOne(condition, options);

        if (!result) {
            const user = {
                _id: ObjectID(),
                userId: userId,
                mailchimpIntegration: false,
                mailchimpAccessToken: '',
                isDeleted: false
            };

            await collection.insertOne(user);
            result = _.omit(user, omitFields)
        }
    } catch (err) {
        throw err
    }
    return result
};
