'use strict';

const deletePublishedLanding = require('./delete-published-landing');

module.exports = async (id) => {
    return await deletePublishedLanding(id, true);
};