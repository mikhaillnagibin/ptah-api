'use strict';

const _ = require('lodash');

module.exports = (landingData) => {
    return _.omit(landingData, ['landing', 'isDeleted']);
};