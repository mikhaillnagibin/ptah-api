'use strict';

module.exports = () => {
    const err = new Error('Bad Request');
    err.status = 400;
    throw err;
};
