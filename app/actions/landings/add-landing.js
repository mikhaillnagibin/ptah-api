'use strict';

const _ = require('lodash');

const {BAD_REQUEST} = require('../../../config/errors');
const getLandingMeta = require('../helpers/get-landing-meta');
const updateLandingData = require('../helpers/update-landing-data');
const getDbCollection = require('../../utils/get-db-collection');

module.exports = async (ctx, next) => {

    const body = ctx.request.body || {};
    const name = (body.name || '').trim();
    const previewUrl = (body.previewUrl || '').trim();
    const landingUpdate = body.landing;

    const update = {};
    if (name) {
        update.name = name;
        update.previewUrl = previewUrl;
    } else {
        return ctx.throw(400, BAD_REQUEST);
    }
    if (landingUpdate && !_.isEmpty(landingUpdate)) {
        update.landing = landingUpdate;
    } else {
        return ctx.throw(400, BAD_REQUEST);
    }

    const data = updateLandingData(ctx, {}, update);

    const collection = getDbCollection.landings(ctx);
    try {
        await collection.insertOne(data);
    } catch (err) {
        throw err
    }

    ctx.status = 201;
    ctx.body = getLandingMeta(data);

    next();
};
