'use strict';

const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const util = require('util');
const unzip = require('unzip');
const ObjectID = require("bson-objectid");
const format = require("string-template");

const config = require('../../config/config');

const badRequest = require('./helpers/bad-request');
const findLandings = require('./helpers/find-landings');
const updateLandingData = require('./helpers/update-landing-data');
const deletePublishedLanding = require('./helpers/delete-published-landing');
const getDbCollection = require('../utils/get-db-collection');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

module.exports = async (ctx, next) => {
    const id = ctx.params.id;

    const file = ctx.request.files.file;
    if (!file) {

    }
    if (!(file.type === 'application/zip' && file.name === 'project.zip')) {
        return badRequest();
    }

    let data = {};
    try {
        const landings = await findLandings(ctx, [id]);
        const landing = landings[0];
        if (landing) {

            // remove previous published landing (and external domain config too), if exists
            deletePublishedLanding(id);

            const landingDestinationDir = path.resolve(config.publicHtmlDir, id);
            fs.mkdirSync(landingDestinationDir, { recursive: true });

            // unzip archive contents to landing's html dir
            const stream = fs.createReadStream(file.path);
            stream.on("error", function(err) {
                throw err;
            });
            stream.pipe(unzip.Extract({ path: landingDestinationDir }));

            // adding config for external domain, if exist
            if (landing.domain) {
                const nginxConfigBuffer = await readFile(config.nginxConfigTemplatePath);

                const nginxConfig = format(nginxConfigBuffer.toString('utf8'), {
                    siteRoot: landingDestinationDir,
                    siteDomain: landing.domain
                });

                const nginxConfigFile = path.resolve(config.nginxConfigsDir, `${id}.conf`);
                writeFile(nginxConfigFile, nginxConfig);
            }

            // finally, updating data in DB
            data = updateLandingData(ctx, landing, {
                isPublished: true,
                hasUnpublishedChanges: false
            });

            const collection = getDbCollection(ctx);

            await collection.updateOne({_id: ObjectID(id)}, {$set: data});
        }
    } catch (err) {
        throw err
    }

    ctx.status = 200;
    ctx.body = _.omit(data, 'landing');
    next();
};
