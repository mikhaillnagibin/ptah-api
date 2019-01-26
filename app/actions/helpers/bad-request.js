'use strict';

module.exports = () => {
    const err = new Error('Bad request');
    err.status = 400;
    throw err;
};
