'use strict';

const ObjectID = require("bson-objectid");

const findLandings = require('./helpers/find-landings');
const deletePublishedLanding = require('./helpers/delete-published-landing');
const getDbCollection = require('../utils/get-db-collection');

module.exports = async (ctx, next) => {
    const id = ctx.params.id;
    try {
        const landings = await findLandings(ctx, [id]);
        const landing = landings[0];
        if (landing) {

            // remove published landing (and external domain config too), if exists
            deletePublishedLanding(id);

            const collection = getDbCollection(ctx);
            await collection.deleteOne({_id: ObjectID(id)}, true);
        }
    } catch (err) {
        throw err
    }

    ctx.status = 204;
    next();
};
