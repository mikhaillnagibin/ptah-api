'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const format = require("string-template");

const config = require('../../../config/config');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

module.exports = async (id, domain) => {

    const landingDestinationDir = path.resolve(config.publicHtmlDir, id);
    fs.mkdirSync(landingDestinationDir, { recursive: true });

    const nginxConfigBuffer = await readFile(config.nginxConfigTemplatePath);

    const nginxConfig = format(nginxConfigBuffer.toString('utf8'), {
        siteRoot: landingDestinationDir,
        siteDomain: domain
    });

    const nginxConfigFile = path.resolve(config.nginxConfigsDir, `${id}.conf`);
    await writeFile(nginxConfigFile, nginxConfig);
};