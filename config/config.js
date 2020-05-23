'use strict';

const path = require('path');

const envUtils = require('../app/utils/env');
const getEnvVariable = envUtils.getEnvVariable;
const getEnvVariableArray = envUtils.getEnvVariableArray;

const publicHtmlDir = getEnvVariable('PUBLIC_HTML_DIR', 'public_html');
const nginxConfigsDir = getEnvVariable('NGINX_CONFIGS_DIR', 'sites_enabled');

const config = {
    serverPort: +getEnvVariable('SERVER_PORT', 3000),

    mongoDsn: getEnvVariable('MONGO_DSN', ''),

    dbLandingsCollectionName: 'ptah-landings',
    dbUsersCollectionName: 'ptah-users',

    redisHost: getEnvVariable('REDIS_HOST', '127.0.0.1'),
    redisPort: +getEnvVariable('REDIS_PORT', '7000'),

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

    auth1ClientId: getEnvVariableArray('AUTH1_CLIENT_ID', '5c6a9d5568add43d9cb21826'),
    auth1ClientSecret: getEnvVariable('AUTH1_CLIENT_SECRET', 'RUOuk4bkWFNljuZzqwq5zrs0GdCLY9U3MJqubuDViUv7XQzgiU84y288Jh0klK1Z'),
    auth1Issuer: getEnvVariable('AUTH1_ISSUER_URL', 'https://auth1.tst.protocol.one/oauth2/introspect'),

    userIdStatePath: 'state.auth1.sub',

    corsValidOrigins: getEnvVariableArray('CORS_VALID_ORIGINS', '*'),

};

module.exports = config;
