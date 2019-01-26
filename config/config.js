'use strict';

const path = require('path');

const envUtils = require('../app/utils/env');
const getEnvVariable = envUtils.getEnvVariable;

const publicHtmlDir = getEnvVariable('PUBLIC_HTML_DIR', 'public_html');
const nginxConfigsDir = getEnvVariable('NGINX_CONFIGS_DIR', 'sites_enabled');

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

    publicHtmlDir: path.resolve(publicHtmlDir),
    nginxConfigsDir: path.resolve(nginxConfigsDir),
    nginxConfigTemplatePath: path.resolve('templates/nginx.conf.template'),
};

module.exports = config;
