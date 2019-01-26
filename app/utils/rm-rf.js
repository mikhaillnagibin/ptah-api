'use strict';

const util = require('util');
const rimraf = require('rimraf');

module.exports = util.promisify(rimraf);
