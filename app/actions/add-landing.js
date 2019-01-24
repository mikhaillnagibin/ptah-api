'use strict';

const _ = require('lodash');

const config = require('../../config/config');
const updateLandingData = require('./helpers/update-landing-data');

module.exports = async (ctx, next) => {

    const body = ctx.request.body || {};

    const data = updateLandingData(ctx, {}, {
        name: (body.name || '').trim(),
        landing: body.landing
    });

    if (!data.name) {
        const err = new Error('Bad request');
        err.status = 400;
        throw err;
    }

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
