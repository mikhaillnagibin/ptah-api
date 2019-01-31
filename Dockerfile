FROM node:11-alpine

RUN apk update && apk add git

WORKDIR /application

ENV NODE_ENV=production \
    DB_AUTH_METHOD="SCRAM-SHA-256" \
    DB_COLLECTION_NAME="ptah" \
    DB_HOST=""   \
    DB_PORT=27017 \
    DB_NAME=""   \
    DB_USER=""   \
    DB_PASS=""   \
    JWT_KEY=""   \
    NGINX_CONFIGS_DIR="/etc/nginx/landings/conf.d" \
    PUBLIC_HTML_DIR="/etc/nginx/landings/public/landings" \
    ROUTES_PREFIX="/landings" \
    SERVER_PORT=3000 \
    SENTRY_DSN=""

COPY package.json /application

RUN npm install && npm prune --production

COPY . /application

EXPOSE 3000

CMD ["node", "./index.js"]
