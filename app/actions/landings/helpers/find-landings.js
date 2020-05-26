'use strict';

const _ = require('lodash');
const ObjectID = require("bson-objectid");

const {AUTHENTICATION_ERROR, BAD_REQUEST, NOT_FOUND} = require('../../../../config/errors');
const config = require('../../../../config/config');
const getDefaultLanding = require('./default-landing');
const getDbCollection = require('../../../utils/get-db-collection');

module.exports = async (ctx, omitLandingBody, ids) => {

    ids = ids || [];

    const hasConditionById = ids.length > 0;

    const userId = _.get(ctx, config.userIdStatePath);
    if (!userId) {
        return ctx.throw(401, AUTHENTICATION_ERROR);
    }

    const omitFields = ['isDeleted'];
    if (omitLandingBody) {
        omitFields.push('landing');
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

    if (hasConditionById) {
        const objIds = ids.map(id => ObjectID.isValid(id) ? ObjectID(id) : ctx.throw(400, BAD_REQUEST));
        condition._id = {$in: objIds};
    } else {
        // suppress landing body while show full list of landings for user,
        // return only metainformation about them
        options.projection.landing = 0;
    }

    const collection = getDbCollection.landings(ctx);

    let result = [];

    try {
        result = await collection.find(condition, options).toArray();
        if (hasConditionById && !result.length) {
            return ctx.throw(404, NOT_FOUND)
        }

    } catch (err) {
        throw err
    }

    const defaultLanding = _.omit(getDefaultLanding(), omitFields);

    return result.map(l => Object.assign({}, defaultLanding, l));
};
