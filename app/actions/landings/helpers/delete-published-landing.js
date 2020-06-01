'use strict';

const fs = require('fs');
const path = require('path');

const config = require('../../../../config/config');

const rmRf = require('../../../utils/rm-rf');

module.exports = async (id) => {

    // remove nginx config, if exists
    const nginxConfigFile = path.resolve(config.nginxConfigsDir, `${id}.conf`);
    if (fs.existsSync(nginxConfigFile)) {
        fs.unlinkSync(nginxConfigFile);
    }

    const landingDestinationDir = path.resolve(config.landingsHtmlDir, id);

    // cleanup landing directory
    await rmRf(landingDestinationDir);
};
