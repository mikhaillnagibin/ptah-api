'use strict';

/* inspired by koa-mongo-driver npm package
 * https://www.npmjs.com/package/koa-mongo-driver
 * except this implementation does no modify ctx.body on db connection errors
 * but simply throws the exception
 */

const { MongoClient } = require('mongodb');

const defaultUrlOptions = {
    host: 'localhost',
    port: 27017,
    databaseName: 'test',
};

const defaultConnectionOptions = {
    useNewUrlParser: true,
};

const buildMongoURL = options => `mongodb://${options.host}:${options.port}/${options.databaseName}`;

const close = (connection) => {
    if (connection) connection.close();
};

const mongo = (customUrlOptions, customConnectionOptions) => {
    const urlOptions = Object.assign({}, defaultUrlOptions, customUrlOptions);
    const connectionOptions = Object.assign(
        {},
        defaultConnectionOptions,
        customConnectionOptions,
    );

    const mongoURL = buildMongoURL(urlOptions);

    return async (ctx, next) => MongoClient.connect(mongoURL, connectionOptions)
        .then(async (connection) => {
            ctx.mongo = connection;
            await next();
        })
        .then(async () => {
            await close(ctx.mongo);
        })
        .catch(async (error) => {
            await close(ctx.mongo);
            throw error;
        });
};

module.exports = mongo;
