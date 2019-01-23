'use strict';

const envUtils = require('../app/utils/env');
const getEnvVariable = envUtils.getEnvVariable;

const config = {
    serverPort: +getEnvVariable('SERVER_PORT', 3000),

    jwtKey: getEnvVariable('JWT_KEY', 'd7e5a85d-b351-4b2f-aa89-f628a00c14e1'),

    dbHost: getEnvVariable('DB_HOST', 'localhost'),
    dbPort: +getEnvVariable('DB_PORT', '27017'),
    dbName: getEnvVariable('DB_NAME', 'ptah'),
    dbUser: getEnvVariable('DB_USER', 'ptah'),
    dbPass: getEnvVariable('DB_PASS', 'ptah'),
    dbPoolMin: +getEnvVariable('DB_POOL_MIN', 1),
    dbPoolMax: +getEnvVariable('DB_POOL_MAX', 100),
    dbCollectionName: getEnvVariable('DB_COLLECTION_NAME', 'ptah'),

    routesPrefix: getEnvVariable('ROUTES_PREFIX', '/landings'),
};

module.exports = config;
