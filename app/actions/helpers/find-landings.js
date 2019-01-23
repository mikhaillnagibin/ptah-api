'use strict';

const mongo = require('koa-mongo');

const config = require('../../../config/config');

module.exports = async (ctx, ids) => {

    ids = ids || [];

    const hasConditionById = ids.length > 0;

    const options = {};

    const condition = {
        userId: ctx.state.user.id
    };

    if (hasConditionById) {
        const objIds = ids.map(id => mongo.ObjectId(id));
        condition._id = {$in: objIds};
    } else {
        options.projection = {landing: 0};
    }

    const collection = ctx.db.collection(config.dbCollectionName);

    let result;

    try {
        result = await collection.find(condition, options).toArray();

        if (hasConditionById) {

            if (!result.length) {
                const err = new Error('Not found');
                err.status = 404;
                throw err;
            }

            if (ids.length === 1) {
                result = result[0];
            }
        }

    } catch (err) {
        throw err
    }
    return result;
};
