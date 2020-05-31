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
* `NODE_ENV={string='production'} AUTH_TOKEN_SECRET={string} PASSWORD_SECRET={string} RESTORE_PASSWORD_SECRET={string} 
CONFIRM_EMAIL_SECRET={string} CORS_VALID_ORIGINS={string} MONGO_DSN={string} EMAIL_POSTMARK_TOKEN={string} 
EMAIL_SENDER_FROM={string} EMAIL_TEMPLATE_RESTORE_PASSWORD={string} EMAIL_TEMPLATE_CONFIRM_EMAIL={string} 
EMAIL_TEMPLATE_USER_SIGNUP_LOCAL={string} EMAIL_TEMPLATE_USER_SIGNUP_SOCIAL={string} SENTRY_DSN={string}  
PUBLIC_HOST={string} EMAIL_TEMPLATE_RESTORE_PASSWORD_REQUEST={string} MAILCHIMP_MAILLISTS_PATH={string='/3.0/lists'} 
MAILCHIMP_METADATA_URL={string='https://login.mailchimp.com/oauth2/metadata'} NGINX_CONFIGS_DIR={string='sites_enabled'} 
LANDINGS_HTML_DIR={string='landings_html'} LANDINGS_PUBLISHING_HOST={string=} ROUTES_PREFIX={string='/api/v1'}
ACCESS_TOKEN_LIFETIME={string='1'} REFRESH_TOKEN_LIFETIME={string='72'} RESTORE_PASSWORD_LIFETIME={string='15'} CONFIRM_EMAIL_LIFETIME={string='24'}
SERVER_PORT={string='80'}  node ./index.js`

Where:

*Obligatory params*

{NODE_ENV} - Current environment

{PUBLIC_HOST} - Public host with frontend

{AUTH_TOKEN_SECRET} - secret for signing auth tokens

{PASSWORD_SECRET} - secret for signing passwords

{RESTORE_PASSWORD_SECRET} - secret for signing restore passwords tokens

{CONFIRM_EMAIL_SECRET} - secret for signing confirm email tokens

{EMAIL_POSTMARK_TOKEN} - token from postmark app to send emails through

{EMAIL_SENDER_FROM} - name and email to substitute to letter's From field 

{EMAIL_TEMPLATE_RESTORE_PASSWORD_REQUEST} - postmark's template id for restore password confirmation mail
 
{EMAIL_TEMPLATE_RESTORE_PASSWORD} - postmark's template id for mail with new password

{EMAIL_TEMPLATE_CONFIRM_EMAIL} - postmark's template id for confirm user email

{EMAIL_TEMPLATE_USER_SIGNUP_LOCAL} - postmark's template id for local signup mail

{EMAIL_TEMPLATE_USER_SIGNUP_SOCIAL} - postmark's template id for social signup mail

{CORS_VALID_ORIGINS} - list of valid origins for CORS protection, separated by comma. 
Notice! Value of * uses by default (disable CORS protection) 

{MONGO_DSN} - DNS for MongoDB connection

{SENTRY_DSN} - public DSN for Sentry

*Optional params*

{MAILCHIMP_MAILLISTS_PATH} - maillists api path for mailchimp: /3.0/lists

{MAILCHIMP_METADATA_URL} - metadata url for mailchimp: https://login.mailchimp.com/oauth2/metadata

{NGINX_CONFIGS_DIR} - Path to shared directory with nginx configs, 'sites_enabled' by default

{LANDINGS_HTML_DIR} - Path to root directory with landings, 'landings_html' by default

{LANDINGS_PUBLISHING_HOST} - Host with published landings (will publish on sub-domain by default)

{ROUTES_PREFIX} - Common prefix for all routes, use /api/v1 by default

{SERVER_PORT} - Port of koa http server

{ACCESS_TOKEN_LIFETIME} - lifetime for access tokens, in hours, 1 by default

{REFRESH_TOKEN_LIFETIME} - lifetime for refresh tokens, in hours, 72 by default

{CONFIRM_EMAIL_LIFETIME} - lifetime for confirm email  tokens, in hours, 24 by default

{RESTORE_PASSWORD_LIFETIME} - lifetime for restore passwords  tokens, in minutes (!), 15 by default

{AUTH_CHECK_USER_AGENT} - check user-agent on auth request, false by default

{GOOGLE_AUTH_CLIENT_ID} - client id for google social auth

{GOOGLE_AUTH_CLIENT_SECRET} - client secret for google social auth

{MAILCHIMP_AUTH_CLIENT_ID} - client id for mailchimp social auth

{MAILCHIMP_AUTH_CLIENT_SECRET} - client secret for mailchimp social auth

## Tests

Integration tests are require an live MongoDB server connection

## API

Api specifications described in spec/openapi.yaml file. You may use Swagger to see them

All integration tests, also, validates their responses throught this specification.
