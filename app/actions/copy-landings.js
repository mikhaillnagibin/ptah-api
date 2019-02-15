'use strict';

const badRequest = require('./helpers/bad-request');
const findLandings = require('./helpers/find-landings');
const updateLandingData = require('./helpers/update-landing-data');
const getDbCollection = require('../utils/get-db-collection');

module.exports = async (ctx, next) => {
    const body = ctx.request.body || {};

    const ids = body.ids;

    if (!(Array.isArray(ids) && ids.length > 0)) {
        return badRequest();
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
        const collection = getDbCollection.landings(ctx);

        await collection.insertMany(newLandings);

    } catch (err) {
        throw err
    }

    ctx.status = 204;

    next();
};
