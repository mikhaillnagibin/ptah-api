'use strict';

const fs = require('fs');
const _ = require('lodash');
const urlJoin = require('url-join');
const urlParse = require('url-parse');
const buildUrl = require('build-url');
const format = require("string-template");
const simpleOauth2 = require('simple-oauth2');

const config = require('../../config/config');
const badRequest = require('../actions/helpers/bad-request');

const oauthPostmessageHtmlTemplate = fs.readFileSync(config.oauthPostmessageHtmlTemplatePath).toString('utf8');

const callbackUrl = buildUrl(config.publicHost, {
    path: urlJoin([config.routesPrefix, config.authNamespace, 'callback'])
});

const authorizeUrl = urlParse(config.oauthAuthorizeUrl);
const tokenUrl = urlParse(config.oauthTokenUrl);

const oauthConfig = {
    // Client ID and secret for OAuth provider
    clientId: config.oauthClientId,
    clientSecret: config.oauthClientSecret,

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

    scope: config.oauthScope,

    oauthPostmessageHtmlTemplate: oauthPostmessageHtmlTemplate
};

const createMiddleware = ({
                              clientId,
                              clientSecret,
                              scope,
                              url,
                              callbackUrl,
                              state,
                              oauthOptions = {},
                              oauthPostmessageHtmlTemplate = '',
                              publicHost
                          }) => {
    // Initialize OAuth
    const oauth2 = simpleOauth2.create({
        ...oauthOptions,
        client: {
            id: clientId,
            secret: clientSecret,
            ...oauthOptions.client
        },
        auth: {
            tokenHost: url,
            ...oauthOptions.auth
        }
    });

    // Login endpoint
    const login = async (ctx) => {
        try {
            // Redirect to OAuth provider
            const url = oauth2.authorizationCode.authorizeURL({
                redirect_uri: callbackUrl,
                scope: scope.join(' '),
                state: state || Math.random().toString(36).substring(2)
            });
            ctx.redirect(url);
        } catch (err) {
            ctx.log.error(err);
            return sendHtmlResponse(ctx, {
                errorCode: 'unknown'
            });
        }
    };

    // Authorized endpoint
    const authorized = async (ctx) => {
        try {
            // we do not require state now
            // || !ctx.query.state || ctx.query.state !== ctx.session.state
            if (!ctx.query.code) {
                const err = new Error('Invalid code or state');
                ctx.log.error(err);
                sendHtmlResponse(ctx, {
                    errorCode: 'invalid_code_or_state'
                })
            }
            // Request access token
            const result = await oauth2.authorizationCode.getToken({
                redirect_uri: callbackUrl,
                code: ctx.query.code
            });
            return sendHtmlResponse(ctx, {
                errorCode: '',
                accessToken: result.access_token,
                refreshToken: result.refresh_token,
                expires_in: result.expires_in,
                blah: 1
            });
        } catch (err) {
            ctx.log.error(err);
            return sendHtmlResponse(ctx, {
                errorCode: 'unknown'
            });
        }
    };

    const refresh = async (ctx) => {
        try {
            const token = createToken(ctx);
            if (!token.token.refresh_token) {
                return badRequest();
            }
            const result = await token.refresh();
            ctx.status = 200;
            ctx.body = {
                access_token: result.access_token,
                refresh_token: result.refresh_token,
                expires_in: result.expires_in
            }
        } catch (err) {
            throw err;
        }
    };

    const logout = async (ctx) => {
        try {
            const token = createToken(ctx);
            if (!token.token.refresh_token || !token.token.access_token) {
                return badRequest();
            }
            await token.revokeAll();
            ctx.status = 204;
        } catch (err) {
            throw err;
        }
    };

    const createToken = (ctx) => {
        const accessToken = (ctx.headers.authorization || '').split(' ').pop();
        const refreshToken = ctx.headers['x-refresh-token'] || '';

        return oauth2.accessToken.create({
            "access_token": accessToken,
            "refresh_token": refreshToken,
            "scope": scope.join(' '),
            "token_type": "bearer"
        });
    };

    const sendHtmlResponse = (ctx, params) => {
        const _params = _.defaults(params, {
            errorCode: 'unknown',
            accessToken: '',
            refreshToken: '',
            expires_in: 0,
            publicHost: publicHost,
        });
        ctx.type = 'html';
        ctx.body =  format(oauthPostmessageHtmlTemplate, _params);
    };

    return {
        login,
        authorized,
        refresh,
        logout
    };
};

const oauthMiddleware = createMiddleware(Object.assign({}, oauthConfig));

module.exports = oauthMiddleware;
