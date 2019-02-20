'use strict';

const fs = require('fs');
const path = require('path');

const config = require('../config/config');

const testDbName = 'ptah-test';
if (config.dbName !== testDbName) {
    console.error(`Probably production database "${config.dbName}" used, instead of "${testDbName}"!`);
    process.exit(1);
}

// starting mock server for integration tests
require('./fakes/external-servers-mockup');

const re = /\.test\.js$/; // names of files with tests must match file mask *.test.js
const testDirs = ['unit', 'integration']; // dirs with tests //

const currentDir = __dirname;
testDirs.forEach( dir => {
    const dirPath = path.join(currentDir, dir);
    fs.readdirSync(dirPath).sort().forEach(function(file) {
        if (re.test(file)) {
            require(path.join(dirPath, file));
        }
    });
});