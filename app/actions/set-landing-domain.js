'use strict';

const ObjectID = require("bson-objectid");
const isDomainName = require("is-domain-name");

const badRequest = require('./helpers/bad-request');
const findLandings = require('./helpers/find-landings');
const getLandingMeta = require('./helpers/get-landing-meta');
const updateLandingData = require('./helpers/update-landing-data');
const addDomainConfig = require('./helpers/add-domain-config');
const deleteDomainConfig = require('./helpers/delete-domain-config');
const getDbCollection = require('../utils/get-db-collection');

module.exports = async (ctx, next) => {
    const id = ctx.params.id;
    const body = ctx.request.body || {};

    const domain = (body.domain || '').trim();
    if (!domain || !isDomainName(domain)) {
        return badRequest();
    }

    let data = {};
    try {
        const landings = await findLandings(ctx, [id]);
        const landing = landings[0];
        if (landing) {

            data = updateLandingData(ctx, landing, {
                domain: domain
            });

            const collection = getDbCollection.landings(ctx);

            await collection.updateOne({_id: ObjectID(id)}, {$set: data});

            // for published landing
            if (data.isPublished) {
                // remove external domain config, if exists
                await deleteDomainConfig(id, true);
                // and adding config for new domain
                await addDomainConfig(id, data.domain);
            }
        }
    } catch (err) {
        throw err
    }

    ctx.status = 200;
    ctx.body = getLandingMeta(data);
    next();
};
