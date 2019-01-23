'use strict';

const _ = require('lodash');

const config = require('../../config/config');
const updateLanding = require('./helpers/update-landing');

module.exports = async (ctx, next) => {

    const data = updateLanding(ctx, {}, {
        name: (ctx.request.body.name || '').trim(),
        landing: ctx.request.body.landing
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
