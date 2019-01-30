'use strict';

const config = require('../../config/config');

module.exports = function (ctx) {
    return ctx.mongo.db(config.dbName).collection(config.dbCollectionName)
};
