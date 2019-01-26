'use strict';

const _ = require('lodash');
const mongo = require('koa-mongo');

const config = require('../../config/config');

const badRequest = require('./helpers/bad-request');
const findLandings = require('./helpers/find-landings');
const updateLandingData = require('./helpers/update-landing-data');

module.exports = async (ctx, next) => {
    const id = ctx.params.id;
    const body = ctx.request.body || {};

    const name = (body.name || '').trim();
    const landingUpdate = body.landing;
    const baseVersion = +(body.baseVersion || '');

    const update = {};
    if (name) {
        update.name = name;
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

            const collection = ctx.db.collection(config.dbCollectionName);

            await collection.updateOne({_id: mongo.ObjectId(id)}, {$set: data});
        }
    } catch (err) {
        throw err
    }

    ctx.status = 200;
    ctx.body = _.omit(data, 'landing');
    next();
};
