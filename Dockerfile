FROM node:lts-alpine

RUN apk update && apk add git

WORKDIR /application

ENV NODE_ENV=production \
    AUTH_TOKEN_SECRET="" \
    PASSWORD_SECRET="" \
    MONGO_DSN="" \
    CORS_VALID_ORIGINS="" \
    MAILCHIMP_METADATA_URL="https://login.mailchimp.com/oauth2/metadata" \
    MAILCHIMP_MAILLISTS_PATH="/3.0/lists" \
    NGINX_CONFIGS_DIR="/etc/nginx/landings/conf.d" \
    LANDINGS_HTML_DIR="/etc/nginx/landings/public/landings" \
    LANDINGS_PUBLISHING_HOST="" \
    ROUTES_PREFIX="/api/v1" \
    SENTRY_DSN="" \
    SERVER_PORT=3000 \
    S3_ACCESS_KEY_ID="" \
    S3_SECRET_ACCESS_KEY="" \
    S3_BUCKET="" \
    S3_REGION="" \
    CDN_HOST="" \
    CDN_PATH="" 

COPY package.json /application

RUN npm install && npm prune --production

COPY . /application

EXPOSE 3000

CMD ["node", "./index.js"]

