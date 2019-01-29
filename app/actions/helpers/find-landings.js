'use strict';

const _ = require('lodash');
const ObjectID = require("bson-objectid");

const badRequest = require('./bad-request');
const getDbCollection = require('../../utils/get-db-collection');

module.exports = async (ctx, ids) => {

    ids = ids || [];

    const hasConditionById = ids.length > 0;

    const userId = _.get(ctx, 'state.user.id');
    if (!userId) {
        throw new Error('User not created');
    }

    const options = {};

    const condition = {
        userId: userId
    };

    if (hasConditionById) {
        const objIds = ids.map(id => ObjectID.isValid(id) ? ObjectID(id) : badRequest());
        condition._id = {$in: objIds};
    } else {
        // suppress landing body while show full list of landings for user,
        // return only metainformation about them
        options.projection = {landing: 0};
    }

    const collection = getDbCollection(ctx);

    let result = [];

    try {
        result = await collection.find(condition, options).toArray();

        if (hasConditionById && !result.length) {
            const err = new Error('Not found');
            err.status = 404;
            throw err;
        }

    } catch (err) {
        throw err
    }
    return result;
};
