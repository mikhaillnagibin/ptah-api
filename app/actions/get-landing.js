'use strict';

const config = require('../../config/config');

const findLandings = require('./helpers/find-landings');

module.exports = async (ctx, next) => {
    const ids = [ctx.params.id];
    try {
        ctx.body = await findLandings(ctx, ids);
    } catch (err) {
        throw err
    }
    next();
};
