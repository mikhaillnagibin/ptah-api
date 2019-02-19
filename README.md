# ptah.api

Backend for PTAH

## Dependencies: 
* Node.js v10+
* NPM v6+
* MongoDB v4+
* Redis v5+

## Deploy
* `npm install`
* `npm test`
* `npm prune --production`
* `NODE_ENV={string='production'} DB_AUTH_METHOD={string='SCRAM-SHA-256'} DB_COLLECTION_NAME={string='ptah'} 
DB_HOST={string='localhost'} DB_NAME={string='ptah'} DB_PASS={string='ptah'} DB_PORT={string='27017'} 
DB_USER={string='ptah'} NGINX_CONFIGS_DIR={string='sites_enabled'} PUBLIC_HTML_DIR={string='public_html'} 
ROUTES_PREFIX={string='/api/v1'} SENTRY_DSN={string} SERVER_PORT={string='80'} REDIS_HOST={string} 
REDIS_PORT={string="6379"} AUTH1_CLIENT_ID={string} AUTH1_CACHE_MAX_AGE={string} AUTH1_INTROSPECTION_URL={string} node ./index.js`

Where:

*Obligatory params*

{DB_AUTH_METHOD} - MongoDB authorization method, if user & password authorization is used

{DB_COLLECTION_NAME} - MongoDB collection name

{DB_HOST} - MongoDB host

{DB_NAME} - MongoDB database name

{DB_PASS} - MongoDB user password (must be an empty string if auth is not used)

{DB_PORT} - MongoDB port

{DB_USER} - MongoDB user name (must be an empty string if auth is not used)

{NGINX_CONFIGS_DIR} - Path to shared directory with nginx configs

{NODE_ENV} - Current environment

{REDIS_HOST} - Redis host

{REDIS_PORT} - Redis post

{AUTH1_CLIENT_ID} - client id for OAuth2 authentication through Auth1 service

{AUTH1_CACHE_MAX_AGE} - time to live for cached results of access token introspection, in milliseconds. Default value
 is 300000 (5 minutes) 

{AUTH1_INTROSPECTION_URL} - full url of Auth1 token introspection endpoint

{PUBLIC_HTML_DIR} - Path to shared directory with landings root

{ROUTES_PREFIX} - Common prefix for all routes, use /api/v1 by default

{SENTRY_DSN} - public DSN for Sentry

{SERVER_PORT} - Port of koa http server

## Tests

Integration tests are require an live MongoDB server connection

## API

Api specifications described in spec/openapi.yaml file. You may use Swagger to see them

All integration tests, also, validates their responses throught this specification.
