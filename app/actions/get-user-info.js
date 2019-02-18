'use strict';

const getUser = require('./helpers/get-user');

module.exports = async (ctx, next) => {
    try {
        ctx.body = await getUser(ctx);
    } catch (err) {
        throw err
    }
    next();
};
