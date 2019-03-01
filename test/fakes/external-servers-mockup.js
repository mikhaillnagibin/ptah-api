'use strict';

const urlParse = require('url-parse');
const ServerMock = require('mock-http-server');

const fakes = require('./fakes');
const config = require('../../config/config');

const port = process.env.MOCK_SERVER_PORT || 3002;
const mailchimpParsedUrl = urlParse(config.mailchimpMetadataUrl);

const server = new ServerMock({ host: 'localhost', port: port });

server.on({
    method: 'post',
    path: '/oauth2/introspect',
    filter: function (req) {
        return !req.body.token
    },
    reply: {
        status: 401,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            error: {
                code: 401,
                message: 'Authentication Error'
            }
        })
    }
});

server.on({
    method: 'post',
    path: '/oauth2/introspect',
    filter: function (req) {
        const token = req.body.token;
        return !(token === fakes.fakeUserAuthToken || token === fakes.fakeAnotherUserAuthToken);
    },
    reply: {
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            active: false
        })
    }
});

server.on({
    method: 'post',
    path: '/oauth2/introspect',
    filter: function (req) {
        const token = req.body.token;
        return token === fakes.fakeUserAuthToken;
    },
    reply: {
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            active: true,
            sub: fakes.fakeUserId,
            token_type: 'access_token',
        })
    }
});

server.on({
    method: 'post',
    path: '/oauth2/introspect',
    filter: function (req) {
        const token = req.body.token;
        return token === fakes.fakeAnotherUserAuthToken;
    },
    reply: {
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            active: true,
            sub: fakes.fakeAnotherUserId,
            token_type: 'access_token',
        })
    }
});

server.on({
    method: 'get',
    path: mailchimpParsedUrl.pathname,
    reply: {
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            api_endpoint: 'http://localhost:' + port 
        })
    }
});

server.on({
    method: 'get',
    path: config.mailchimpMaillistsPath,
    reply: {
        status: 200,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(fakes.fakeMaillistData)
    }
});

module.exports = server;
