# ptah.api

Backend for PTAH

## Dependencies: 
* Node.js v10+
* NPM v6+
* MongoDB v4+

## Deploy
* `npm install`
* `npm test`
* `npm prune --production`
* `NODE_ENV={string='production'} DB_AUTH_METHOD={string='SCRAM-SHA-256'} DB_COLLECTION_NAME={string='ptah'} 
DB_HOST={string='localhost'} 
DB_NAME={string='ptah'} DB_PASS={string='ptah'} DB_PORT={string='27017'} DB_USER={string='ptah'} JWT_KEY={string='d7e5a85d-b351-4b2f-aa89-f628a00c14e1'} NGINX_CONFIGS_DIR={string='sites_enabled'} PUBLIC_HTML_DIR={string='public_html'} ROUTES_PREFIX={string='/landings'} SERVER_PORT={string='3000'} node ./index.js`

Where:

*Obligatory params*

{DB_AUTH_METHOD} - MongoDB authorization method, if user & password authorization is used

{DB_COLLECTION_NAME} - MongoDB collection name

{DB_HOST} - MongoDB host

{DB_NAME} - MongoDB database name

{DB_PASS} - MongoDB user password (must be an empty string if auth is not used)

{DB_PORT} - MongoDB port

{DB_USER} - MongoDB user name (must be an empty string if auth is not used)

{JWT_KEY} - Secret key foк validate auth JWT tokens

{NGINX_CONFIGS_DIR} - Path to shared directory with nginx configs

{NODE_ENV} - Current environment

{PUBLIC_HTML_DIR} - Path to shared directory with landings root

{ROUTES_PREFIX} - Common prefix for all routes, use /landings by default

{SERVER_PORT} - Port of koa http server

## Tests

Integration tests are require an live MongoDB server connection

## API

Api specifications described in spec/openapi.yaml file. You may use Swagger to see them

All integration tests, also, validates their responses throught this specification.