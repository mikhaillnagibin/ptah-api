// In this file you can configure migrate-mongo
const DSNParser = require('dsn-parser');

const config = require('./config/config');

function getUrl(mongoDsn) {
    const dsn = new DSNParser(mongoDsn);
    dsn.set('database', null);
    return dsn.getDSN();
}

function getDbName(mongoDsn) {
    const dsn = new DSNParser(mongoDsn);
    return dsn.get('database');
}

const cfg = {
    mongodb: {
        url: getUrl(config.mongoDsn),

        databaseName: getDbName(config.mongoDsn),

        options: {
            useNewUrlParser: true, // removes a deprecation warning when connecting
            useUnifiedTopology: true,
            //   connectTimeoutMS: 3600000, // increase connection timeout to 1 hour
            //   socketTimeoutMS: 3600000, // increase socket timeout to 1 hour
        }
    },

  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: "migrations",

  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: "changelog"
};

//Return the config as a promise
module.exports = cfg;
