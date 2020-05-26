'use strict';

const findLandings = require('./helpers/find-landings');

module.exports = async (ctx, next) => {
    const ids = [ctx.params.id];
    try {
        const landings = await findLandings(ctx, false, ids);
        ctx.body = landings[0];
    } catch (err) {
        throw err
    }
    next();
};
