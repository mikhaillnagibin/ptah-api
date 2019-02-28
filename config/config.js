'use strict';

const path = require('path');

const envUtils = require('../app/utils/env');
const getEnvVariable = envUtils.getEnvVariable;
const getEnvVariableArray = envUtils.getEnvVariableArray;

const publicHtmlDir = getEnvVariable('PUBLIC_HTML_DIR', 'public_html');
const nginxConfigsDir = getEnvVariable('NGINX_CONFIGS_DIR', 'sites_enabled');

const config = {
    serverPort: +getEnvVariable('SERVER_PORT', 3000),

    dbHost: getEnvVariable('DB_HOST', 'localhost'),
    dbPort: +getEnvVariable('DB_PORT', '27017'),
    dbName: getEnvVariable('DB_NAME', 'ptah'),
    dbUser: getEnvVariable('DB_USER', 'ptah'),
    dbPass: getEnvVariable('DB_PASS', 'ptah'),
    dbAuthMethod: getEnvVariable('DB_AUTH_METHOD', 'SCRAM-SHA-256'),

    dbLandingsCollectionName: 'ptah-landings',
    dbUsersCollectionName: 'ptah-users',

    redisHost: getEnvVariable('REDIS_HOST', '192.168.99.100'),
    redisPort: +getEnvVariable('REDIS_PORT', '6379'),

    routesPrefix: getEnvVariable('ROUTES_PREFIX', '/api/v1'),

    landingsRoutesNamespace: '/landings',
    mailchimpRoutesNamespace: '/mailchimp',
    userRoutesNamespace: '/user',

    publicHtmlDir: path.resolve(publicHtmlDir),
    nginxConfigsDir: path.resolve(nginxConfigsDir),
    nginxConfigTemplatePath: path.resolve('templates/nginx.conf.template'),

    sentryDsn: getEnvVariable('SENTRY_DSN', 'https://f1fe9d5210df4b82aabe49839b197763@sentry.tst.protocol.one/4'),

    mailchimpMetadataUrl: getEnvVariable('MAILCHIMP_METADATA_URL', 'https://login.mailchimp.com/oauth2/metadata'),
    mailchimpMaillistsPath: getEnvVariable('MAILCHIMP_MAILLISTS_PATH', '/3.0/lists'),

    auth1Issuer: getEnvVariable('AUTH1_ISSUER_URL', 'https://auth1.tst.protocol.one/oauth2/introspect'),

    userIdStatePath: 'state.auth1.sub',

    corsValidOrigins: getEnvVariableArray('CORS_VALID_ORIGINS', '*'),

};

module.exports = config;
