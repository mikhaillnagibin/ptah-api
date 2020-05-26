'use strict';

const urlParse = require('url-parse');
const ServerMock = require('mock-http-server');

const fakes = require('./fakes');
const config = require('../../config/config');

const port = process.env.MOCK_SERVER_PORT || 3002;
const mailchimpParsedUrl = urlParse(config.mailchimpMetadataUrl);

const server = new ServerMock({ host: 'localhost', port: port });

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
