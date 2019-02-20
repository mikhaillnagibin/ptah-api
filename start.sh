#!/bin/sh
cd ./migrations
node ./../node_modules/migrate-mongo/bin/migrate-mongo.js up
cd ..
node ./index.js

