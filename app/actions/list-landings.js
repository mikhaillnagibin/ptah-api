'use strict';

const findLandings = require('./helpers/find-landings');

module.exports = async (ctx, next) => {
    try {
        ctx.body = await findLandings(ctx);
    } catch (err) {
        throw err
    }
    next();
};
