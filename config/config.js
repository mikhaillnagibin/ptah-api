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

    publicHost: getEnvVariable('PUBLIC_HOST', ''),

    dbLandingsCollectionName: 'ptah-landings',
    dbUsersCollectionName: 'ptah-users',
    dbUsersSessionsCollectionName: 'ptah-users-sessions',

    routesPrefix: getEnvVariable('ROUTES_PREFIX', '/api/v1'),

    authRoutesNamespace: '/auth',
    landingsRoutesNamespace: '/landings',
    mailchimpRoutesNamespace: '/mailchimp',
    userRoutesNamespace: '/user',

    publicHtmlDir: path.resolve(publicHtmlDir),
    nginxConfigsDir: path.resolve(nginxConfigsDir),
    nginxConfigTemplatePath: path.resolve('templates/nginx.conf.template'),

    sentryDsn: getEnvVariable('SENTRY_DSN', 'https://f1fe9d5210df4b82aabe49839b197763@sentry.tst.protocol.one/4'),

    mailchimpMetadataUrl: getEnvVariable('MAILCHIMP_METADATA_URL', 'https://login.mailchimp.com/oauth2/metadata'),
    mailchimpMaillistsPath: getEnvVariable('MAILCHIMP_MAILLISTS_PATH', '/3.0/lists'),

    userStatePath: 'state.user',
    userIdStatePath: 'state.user._id',

    corsValidOrigins: getEnvVariableArray('CORS_VALID_ORIGINS', '*'),

    authCheckUserAgent: getEnvVariable('AUTH_CHECK_USER_AGENT', '') === 'true',

    authTokenSecret: getEnvVariable('AUTH_TOKEN_SECRET', ''),
    accessTokenLifetime: +getEnvVariable('ACCESS_TOKEN_LIFETIME', 1) * 60 * 60,
    refreshTokenLifetime: +getEnvVariable('REFRESH_TOKEN_LIFETIME', 72) * 60 * 60,

    passwordSecret: getEnvVariable('PASSWORD_SECRET', ''),

    restorePasswordSecret: getEnvVariable('RESTORE_PASSWORD_SECRET', ''),
    restorePasswordLifetime: +getEnvVariable('RESTORE_PASSWORD_LIFETIME', 15) * 60,

    confirmEmailSecret: getEnvVariable('CONFIRM_EMAIL_SECRET', ''),
    confirmEmailLifetime: +getEnvVariable('CONFIRM_EMAIL_LIFETIME', 24) * 60 * 60,

    emailpostmarkToken: getEnvVariable('EMAIL_POSTMARK_TOKEN', ''),
    emailSenderFrom: getEnvVariable('EMAIL_SENDER_FROM', ''),

    emailTemplateConfirmEmail: +getEnvVariable('EMAIL_TEMPLATE_CONFIRM_EMAIL', ''),
    emailTemplateUserSignupLocal: +getEnvVariable('EMAIL_TEMPLATE_USER_SIGNUP_LOCAL', ''),
    emailTemplateUserSignupSocial: +getEnvVariable('EMAIL_TEMPLATE_USER_SIGNUP_SOCIAL', ''),
    emailTemplateRestorePassword: +getEnvVariable('EMAIL_TEMPLATE_RESTORE_PASSWORD', ''),
    emailTemplateRestorePasswordRequest: +getEnvVariable('EMAIL_TEMPLATE_RESTORE_PASSWORD_REQUEST', ''),

    googleAuthClientId: getEnvVariable('GOOGLE_AUTH_CLIENT_ID', ''),
    googleAuthClientSecret: getEnvVariable('GOOGLE_AUTH_CLIENT_SECRET', ''),

    mailchimpAuthClientId: getEnvVariable('MAILCHIMP_AUTH_CLIENT_ID', '462853669980'),
    mailchimpAuthClientSecret: getEnvVariable('MAILCHIMP_AUTH_CLIENT_SECRET', '76db4d17f02fa0a036054278e08beaa0af50c328ba7e435b26'),

    passwordRequirements: {
        length: 8,
        lowercase: true,
        uppercase: true,
        numbers: true,
        symbols: true,
    }

};

module.exports = config;
