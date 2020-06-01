'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const decompress = require('decompress');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const fakes = require('../fakes/fakes');
const config = require('../../config/config');

const deletePublishedLanding = require('../../app/actions/landings/helpers/delete-published-landing');

const id = fakes.fakeId;
const landingDestinationDir = path.resolve(config.landingsHtmlDir, id);
const nginxConfigFile = path.resolve(config.nginxConfigsDir, `${id}.conf`);

describe('delete-published-landing test', () => {
    before(() => {
        return new Promise((resolve) => {
            (async function () {

                fs.mkdirSync(landingDestinationDir, {recursive: true});

                // unzip archive contents to landing's html dir
                await decompress(fakes.fakeProjectZipPath, landingDestinationDir, {strip: 1});

                const nginxConfigBuffer = await readFile(config.nginxConfigTemplatePath);
                await writeFile(nginxConfigFile, nginxConfigBuffer.toString('utf8'));
                resolve();
            })();
        });
    });

    it('Should delete landing files and configs', async () => {
        await deletePublishedLanding(id);

        fs.existsSync(landingDestinationDir).should.be.false;
        fs.existsSync(nginxConfigFile).should.be.false;
    });


    it('Should not throw errors even if landing files or configs are not exists', async () => {
        await deletePublishedLanding('12345567');
    });


});
