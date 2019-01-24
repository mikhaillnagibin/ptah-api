'use strict';

const config = require('../../config/config');

const findLandings = require('./helpers/find-landings');
const updateLandingData = require('./helpers/update-landing-data');

module.exports = async (ctx, next) => {
    const body = ctx.request.body || {};

    const ids = body.ids;

    if (!(Array.isArray(ids) && ids.length > 0)) {
        const err = new Error('Bad request');
        err.status = 400;
        throw err;
    }

    const currentDateTime = (new Date()).toISOString()
        .replace(/([^T]+)T([^.]+).*/g, '$1 $2');

    try {
        const landings = await findLandings(ctx, ids);
        const newLandings = landings.map((landing) => {
            return updateLandingData(ctx, {}, {
                name: `${landing.name} [copy from ${currentDateTime}]`,
                landing: landing.landing
            })
        });
        const collection = ctx.db.collection(config.dbCollectionName);

        await collection.insertMany(newLandings);

    } catch (err) {
        throw err
    }

    ctx.status = 204;

    next();
};
