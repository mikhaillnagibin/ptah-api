'use strict';

const findLandings = require('./helpers/find-landings');

module.exports = async (ctx, next) => {
    try {
        const landings = await findLandings(ctx, true);
        ctx.body = {
            landings: landings
        }
    } catch (err) {
        throw err
    }
    next();
};
