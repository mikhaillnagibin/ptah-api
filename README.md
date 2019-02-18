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
DB_HOST={string='localhost'} DB_NAME={string='ptah'} DB_PASS={string='ptah'} DB_PORT={string='27017'} 
DB_USER={string='ptah'} JWT_KEY={string} NGINX_CONFIGS_DIR={string='sites_enabled'} 
PUBLIC_HTML_DIR={string='public_html'} ROUTES_PREFIX={string='/api/v1'} SENTRY_DSN={string} SERVER_PORT={string='80'} 
PUBLIC_HOST={string='https://landings.protocol.one'} AUTH1_CLIENT_ID={string} AUTH1_CLIENT_SECRET={string} 
AUTH1_CLIENT_SCOPE={string} AUTH1_AUTHORIZE_URL={string=https://auth1.protocol.one/oauth2/auth} 
AUTH1_TOKEN_URL={string=https://auth1.protocol.one/oauth2/token} node ./index.js`

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

{AUTH1_CLIENT_ID} - client id for OAuth2 authentication through Auth1 service

{AUTH1_CLIENT_SECRET} - client secret for OAuth2 authentication through Auth1 service

{AUTH1_CLIENT_SCOPE} - required client scope for OAuth2 authentication through Auth1 service

{AUTH1_AUTHORIZE_URL} - full url of Auth1 authorize endpoint 

{AUTH1_TOKEN_URL} - full url of Auth1 token endpoint

{PUBLIC_HOST} - Public host url, for example https://landings.protocol.one

{PUBLIC_HTML_DIR} - Path to shared directory with landings root

{ROUTES_PREFIX} - Common prefix for all routes, use /api/v1 by default

{SENTRY_DSN} - public DSN for Sentry

{SERVER_PORT} - Port of koa http server

## Tests

Integration tests are require an live MongoDB server connection

## API

Api specifications described in spec/openapi.yaml file. You may use Swagger to see them

All integration tests, also, validates their responses throught this specification.
