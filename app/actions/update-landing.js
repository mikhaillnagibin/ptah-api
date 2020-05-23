'use strict';

const _ = require('lodash');
const ObjectID = require("bson-objectid");

const badRequest = require('./helpers/bad-request');
const findLandings = require('./helpers/find-landings');
const getLandingMeta = require('./helpers/get-landing-meta');
const updateLandingData = require('./helpers/update-landing-data');
const getDbCollection = require('../utils/get-db-collection');

module.exports = async (ctx, next) => {
    const id = ctx.params.id;
    const body = ctx.request.body || {};

    const name = (body.name || '').trim();
    const previewUrl = (body.previewUrl || '').trim();
    const landingUpdate = body.landing;
    const baseVersion = +(body.baseVersion || '');

    const update = {};
    if (name) {
        update.name = name;
    }
    if (previewUrl) {
        update.previewUrl = previewUrl;
    }
    if (landingUpdate && !_.isEmpty(landingUpdate)) {
        update.landing = landingUpdate;
    }

    if (_.isEmpty(update) || !baseVersion) {
        return badRequest();
    }

    let data = {};
    try {
        const landings = await findLandings(ctx, [id]);
        const landing = landings[0];
        if (landing) {

            // prevent inconsistent updates
            if (landing.currentVersion !== baseVersion) {
                const err = new Error('Precondition Failed');
                err.status = 412;
                throw err;
            }

            data = updateLandingData(ctx, landing, update);

            const collection = getDbCollection.landings(ctx);

            await collection.updateOne({_id: ObjectID(id)}, {$set: data});
        }
    } catch (err) {
        throw err
    }

    ctx.status = 200;
    ctx.body = getLandingMeta(data);
    next();
};
