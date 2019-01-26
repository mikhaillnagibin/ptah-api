'use strict';

const _ = require('lodash');

const config = require('../../config/config');
const badRequest = require('./helpers/bad-request');
const updateLandingData = require('./helpers/update-landing-data');

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

    const collection = ctx.db.collection(config.dbCollectionName);
    try {
        await collection.insertOne(data);
    } catch (err) {
        throw err
    }

    ctx.status = 201;
    ctx.body = _.omit(data, 'landing');

    next();
};
