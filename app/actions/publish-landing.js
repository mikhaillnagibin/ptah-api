'use strict';

const _ = require('lodash');
const mongo = require('koa-mongo');

const config = require('../../config/config');

const findLandings = require('./helpers/find-landings');
const updateLanding = require('./helpers/update-landing');

module.exports = async (ctx, next) => {
    const id = ctx.params.id;
    let data = {};
    try {
        const landing = await findLandings(ctx, [id]);
        if (landing) {

            // todo: do publish landing

            data = updateLanding(ctx, landing, {
                isPublished: true
            });

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
