FROM node:lts-alpine

RUN apk update && apk add git

WORKDIR /application

ENV NODE_ENV=production \
    AUTH1_CLIENT_ID="" \
    AUTH1_CLIENT_SECRET="" \
    AUTH1_ISSUER_URL="" \
    DB_AUTH_METHOD="SCRAM-SHA-256" \
    DB_COLLECTION_NAME="ptah" \
    DB_HOST="" \
    DB_NAME="ptah" \
    DB_PASS="" \
    DB_PORT=27017 \
    DB_USER="" \
    CORS_VALID_ORIGINS="" \
    MAILCHIMP_METADATA_URL="https://login.mailchimp.com/oauth2/metadata" \
    MAILCHIMP_MAILLISTS_PATH="/3.0/lists" \
    NGINX_CONFIGS_DIR="/etc/nginx/landings/conf.d" \
    PUBLIC_HTML_DIR="/etc/nginx/landings/public/landings" \
    REDIS_HOST="" \
    REDIS_PORT="6379" \
    ROUTES_PREFIX="/api/v1" \
    SENTRY_DSN="" \
    SERVER_PORT=3000


COPY package.json /application

RUN npm install && npm prune --production

COPY . /application

EXPOSE 3000

CMD ["node", "./index.js"]

