[![Build Status](https://travis-ci.org/ProtocolONE/ptah-api.svg?branch=master)](https://travis-ci.org/ProtocolONE/ptah-api) 
[![codecov](https://codecov.io/gh/ProtocolONE/ptah-api/branch/master/graph/badge.svg)](https://codecov.io/gh/ProtocolONE/ptah-api)

# ptah-api

Backend for PTAH

## Dependencies: 
* Node.js v10+
* NPM v6+
* MongoDB v4+
* Redis v5+

## Deploy
* `npm install`
* `npm prune --production`
* `NODE_ENV={string='production'} AUTH1_CLIENT_ID={string} AUTH1_CLIENT_SECRET={string} AUTH1_ISSUER_URL={string} 
CORS_VALID_ORIGINS={string} MONGO_DSN={string} MAILCHIMP_MAILLISTS_PATH={string='/3.0/lists'} 
MAILCHIMP_METADATA_URL={string='https://login.mailchimp.com/oauth2/metadata'} NGINX_CONFIGS_DIR={string='sites_enabled'} 
PUBLIC_HTML_DIR={string='public_html'} REDIS_HOST={string} REDIS_PORT={string="6379"} ROUTES_PREFIX={string='/api/v1'} 
SENTRY_DSN={string} SERVER_PORT={string='80'}  node ./index.js`

Where:

*Obligatory params*

{AUTH1_CLIENT_ID} - client id for OAuth2 authentication through Auth1 service

{AUTH1_CLIENT_SECRET} - client secret for OAuth2 authentication through Auth1 service

{AUTH1_ISSUER_URL} - url of Auth1 host 

{CORS_VALID_ORIGINS} - list of valid origins for CORS protection, separated by comma. 
Notice! Value of * uses by default (disable CORS protection) 

{MONGO_DSN} - DNS for MongoDB connection

{MAILCHIMP_MAILLISTS_PATH} - maillists api path for mailchimp: /3.0/lists

{MAILCHIMP_METADATA_URL} - metadata url for mailchimp: https://login.mailchimp.com/oauth2/metadata

{NGINX_CONFIGS_DIR} - Path to shared directory with nginx configs

{NODE_ENV} - Current environment

{PUBLIC_HTML_DIR} - Path to shared directory with landings root

{REDIS_HOST} - Redis host

{REDIS_PORT} - Redis post

{ROUTES_PREFIX} - Common prefix for all routes, use /api/v1 by default

{SENTRY_DSN} - public DSN for Sentry

{SERVER_PORT} - Port of koa http server

## Tests

Integration tests are require an live MongoDB server connection

## API

Api specifications described in spec/openapi.yaml file. You may use Swagger to see them

All integration tests, also, validates their responses throught this specification.
