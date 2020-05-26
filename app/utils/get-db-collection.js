'use strict';
const DSNParser = require('dsn-parser');

const config = require('../../config/config');

const dsn = new DSNParser(config.mongoDsn);
const dbName = dsn.get('database');

module.exports.landings = function (ctx) {
    return ctx.mongo.db(dbName).collection(config.dbLandingsCollectionName)
};

module.exports.users = function (ctx) {
    return ctx.mongo.db(dbName).collection(config.dbUsersCollectionName)
};

module.exports.users_sessions = function (ctx) {
    return ctx.mongo.db(dbName).collection(config.dbUsersSessionsCollectionName)
};
