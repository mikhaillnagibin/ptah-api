'use strict';

/* inspired by koa-mongo-driver npm package
 * https://www.npmjs.com/package/koa-mongo-driver
 * except this implementation does no modify ctx.body on db connection errors
 * but simply throws the exception
 */

const DSNParser = require('dsn-parser');
const { MongoClient } = require('mongodb');

const defaultConnectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

const mongo = (dsn, customConnectionOptions) => {
    const connectionOptions = Object.assign(
        {},
        defaultConnectionOptions,
        customConnectionOptions,
    );

    const dsnParsed = new DSNParser(dsn);
    const dbName = dsnParsed.get('database');

    let mongoConnection;

    return async (ctx, next) => MongoClient.connect(dsn, connectionOptions)
        .then(async (connection) => {
            mongoConnection = connection;
            ctx.mongo = mongoConnection.db(dbName);
            await next();
        })
        .then(async () => {
            if (mongoConnection) mongoConnection.close();
        })
        .catch(async (error) => {
            if (mongoConnection) mongoConnection.close();
            throw error;
        });
};

module.exports = {
    mongo,
    defaultConnectionOptions,
}

