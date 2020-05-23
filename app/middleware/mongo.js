'use strict';

/* inspired by koa-mongo-driver npm package
 * https://www.npmjs.com/package/koa-mongo-driver
 * except this implementation does no modify ctx.body on db connection errors
 * but simply throws the exception
 */

const { MongoClient } = require('mongodb');

const defaultConnectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

const close = (connection) => {
    if (connection) connection.close();
};

const mongo = (dsn, customConnectionOptions) => {
    const connectionOptions = Object.assign(
        {},
        defaultConnectionOptions,
        customConnectionOptions,
    );

    return async (ctx, next) => MongoClient.connect(dsn, connectionOptions)
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
