'use strict';

const fs = require('fs');
const path = require('path');
const util = require('util');
const format = require("string-template");

const config = require('../../../../config/config');
const nginxConfigTemplate = fs.readFileSync(config.nginxConfigTemplatePath).toString('utf8');

const writeFile = util.promisify(fs.writeFile);

module.exports = async (id, domain) => {

    const landingDestinationDir = path.resolve(config.landingsHtmlDir, id);
    fs.mkdirSync(landingDestinationDir, { recursive: true });

    const nginxConfig = format(nginxConfigTemplate, {
        siteRoot: landingDestinationDir,
        siteDomain: domain
    });

    const nginxConfigFile = path.resolve(config.nginxConfigsDir, `${id}.conf`);
    await writeFile(nginxConfigFile, nginxConfig);
};
