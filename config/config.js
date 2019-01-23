'use strict';

const envUtils = require('../app/utils/env');
const getEnvVariable = envUtils.getEnvVariable;

const config = {
    serverPort: +getEnvVariable('SERVER_PORT', 3000),
};

module.exports = config;
