'use strict';

const envUtils = require('../app/utils/env');
const getEnvVariable = envUtils.getEnvVariable;

const config = {
    serverPort: +getEnvVariable('SERVER_PORT', 3000),
    jwtKey: getEnvVariable('JWT_KEY', 'd7e5a85d-b351-4b2f-aa89-f628a00c14e1'),
};

module.exports = config;
