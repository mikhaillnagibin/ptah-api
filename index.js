'use strict';

const {database, up} = require('migrate-mongo');

// doing db migrations before app start
database.connect()
    .then((db) => {
        up(db)
            .then((migrated) => {
                migrated.forEach(fileName => console.log('Migrated:', fileName));

                require('./app/app');
            });
    })
    .catch((err) => {
        throw (err);
    });


