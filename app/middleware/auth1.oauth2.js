'use strict';

const fs = require('fs');
const urlJoin = require('url-join');
const urlParse = require('url-parse');
const buildUrl = require('build-url');

const config = require('../../config/config');
const createMiddleware = require('./oauth2');

const auth1PostmessageHtmlTemplate = fs.readFileSync(config.auth1PostmessageHtmlTemplatePath).toString('utf8');

const callbackUrl = buildUrl(config.publicHost, {
    path: urlJoin([config.routesPrefix, config.auth1Namespace, 'callback'])
});

const authorizeUrl = urlParse(config.auth1AuthorizeUrl);
const tokenUrl = urlParse(config.auth1TokenUrl);

const oauthConfig = {
    // Client ID and secret for OAuth provider
    clientId: config.auth1ClientId,
    clientSecret: config.auth1ClientSecret,

    // Redirect URL for this application, i.e. where you mounted the authorized middleware
    callbackUrl: callbackUrl,

    publicHost: config.publicHost,

    // These options are passed to simple-oauth2, see https://github.com/lelylan/simple-oauth2
    oauthOptions: {
        auth: {
            tokenHost: tokenUrl.origin,
            tokenPath: tokenUrl.pathname,
            authorizeHost: authorizeUrl.origin,
            authorizePath: authorizeUrl.pathname,
        },
    },

    scope: config.auth1Scope,

    postmessageHtmlTemplate: auth1PostmessageHtmlTemplate
};


const oauthMiddleware = createMiddleware(Object.assign({}, oauthConfig));

module.exports = oauthMiddleware;