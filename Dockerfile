FROM node:lts-alpine

RUN apk update && apk add git

WORKDIR /application

ENV NODE_ENV=production \
    AUTH1_CLIENT_ID="" \
    AUTH1_CLIENT_SECRET="" \
    AUTH1_ISSUER_URL="" \
    MONGO_DSN="" \
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

