'use strict';

const _ = require('lodash');

const badRequest = require('./helpers/bad-request');
const updateLandingData = require('./helpers/update-landing-data');
const getDbCollection = require('../utils/get-db-collection');

module.exports = async (ctx, next) => {

    const body = ctx.request.body || {};
    const name = (body.name || '').trim();
    const landingUpdate = body.landing;

    const update = {};
    if (name) {
        update.name = name;
    }
    if (landingUpdate && !_.isEmpty(landingUpdate)) {
        update.landing = landingUpdate;
    }

    if (_.isEmpty(update)) {
        return badRequest();
    }

    const data = updateLandingData(ctx, {}, update);

    const collection = getDbCollection(ctx);
    try {
        await collection.insertOne(data);
    } catch (err) {
        throw err
    }

    ctx.status = 201;
    ctx.body = _.omit(data, 'landing');

    next();
};
