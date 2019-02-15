'use strict';

const _ = require('lodash');
const format = require("string-template");
const simpleOauth2 = require('simple-oauth2');

const badRequest = require('../actions/helpers/bad-request');

module.exports = ({
                              clientId,
                              clientSecret,
                              scope,
                              url,
                              callbackUrl,
                              state,
                              oauthOptions = {},
                              postmessageHtmlTemplate = '',
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
            ctx.state = cts.state || {};
            ctx.state.oauth2 = result;
            return sendHtmlResponse(ctx, {
                errorCode: '',
                accessToken: result.access_token,
                refreshToken: result.refresh_token,
                expires_in: result.expires_in
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
        let oauth2Token = _.get(ctx, 'state.oauth2');
        if (!oauth2Token) {
            oauth2Token = {
                accessToken: (ctx.headers.authorization || '').split(' ').pop(),
                refreshToken: ctx.headers['x-refresh-token'] || ''
            }
        }

        const tokenParams = _.defaults(oauth2Token, {
            "scope": scope.join(' '),
            "token_type": "bearer"
        });

        return oauth2.accessToken.create(tokenParams);
    };

    const sendHtmlResponse = (ctx, params) => {
        const _params = _.defaults(params, {
            errorCode: 'unknown',
            accessToken: '',
            refreshToken: '',
            expires_in: 0,
            publicHost: publicHost,
        });
        _params.isSuccess = _params.errorCode === '';
        ctx.type = 'html';
        ctx.body =  format(postmessageHtmlTemplate, _params);
    };

    return {
        login,
        authorized,
        refresh,
        logout
    };
};
