'use strict';

const config = require('../../config/config');

module.exports.landings = function (ctx) {
    return ctx.mongo.db(config.dbName).collection(config.dbLandingsCollectionName)
};

module.exports.users = function (ctx) {
    return ctx.mongo.db(config.dbName).collection(config.dbUsersCollectionName)
};
