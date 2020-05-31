'use strict';

const ObjectID = require("bson-objectid");
const punycode = require("punycode")
const isValidDomain = require("is-valid-domain");

const config = require('../../../config/config');

const {BAD_REQUEST} = require('../../../config/errors');
const findLandings = require('./helpers/find-landings');
const getLandingMeta = require('./helpers/get-landing-meta');
const updateLandingData = require('./helpers/update-landing-data');
const addDomainConfig = require('./helpers/add-domain-config');
const getDbCollection = require('../../utils/get-db-collection');

module.exports = async (ctx, next) => {
    const id = ctx.params.id;
    const body = ctx.request.body || {};

    let domain = (body.domain || '').trim();
    const isPersonal = !!body.personal;

    if (!domain) {
        return ctx.throw(400, BAD_REQUEST);
    }

    if (!isPersonal && isValidDomain(domain)) {
        return ctx.throw(400, BAD_REQUEST);
    }

    domain = punycode.toASCII(domain)

    if (!isPersonal) {
        domain += '.' + config.landingsPublishingHost;
    }

    if (!isValidDomain(domain)) {
        return ctx.throw(400, BAD_REQUEST);
    }

    let data = {};
    try {
        const landings = await findLandings(ctx, false, [id]);
        const landing = landings[0];
        if (landing) {

            data = updateLandingData(ctx, landing, {
                domain: domain
            });

            const collection = getDbCollection.landings(ctx);

            await collection.updateOne({_id: ObjectID(id)}, {$set: data});

            // for published landing
            if (landing.isPublished) {
                // replacing config for renew domain
                await addDomainConfig(id, domain);
            }
        }
    } catch (err) {
        throw err
    }

    ctx.status = 200;
    ctx.body = getLandingMeta(data);
    next();
};
