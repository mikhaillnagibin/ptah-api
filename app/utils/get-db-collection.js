'use strict';

const config = require('../../config/config');

module.exports.landings = function (ctx) {
    return ctx.mongo.collection(config.dbLandingsCollectionName)
};

module.exports.users = function (ctx) {
    return ctx.mongo.collection(config.dbUsersCollectionName)
};

module.exports.users_sessions = function (ctx) {
    return ctx.mongo.collection(config.dbUsersSessionsCollectionName)
};
