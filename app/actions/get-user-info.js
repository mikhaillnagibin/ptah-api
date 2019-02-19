'use strict';
const _ = require('lodash');

const getUser = require('./helpers/get-user');

module.exports = async (ctx, next) => {
    try {
        const user = await getUser(ctx);
        ctx.body = _.pick(user, ['userId', 'mailchimpIntegration'])
    } catch (err) {
        throw err
    }
    next();
};
