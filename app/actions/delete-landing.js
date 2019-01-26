'use strict';

const mongo = require('koa-mongo');

const config = require('../../config/config');

const findLandings = require('./helpers/find-landings');
const deletePublishedLanding = require('./helpers/delete-published-landing');

module.exports = async (ctx, next) => {
    const id = ctx.params.id;
    try {
        const landings = await findLandings(ctx, [id]);
        const landing = landings[0];
        if (landing) {

            // remove published landing (and external domain config too), if exists
            deletePublishedLanding(id);

            const collection = ctx.db.collection(config.dbCollectionName);
            await collection.remove({_id: mongo.ObjectId(id)}, true);
        }
    } catch (err) {
        throw err
    }

    ctx.status = 204;
    next();
};
