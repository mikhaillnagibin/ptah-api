'use strict';

const {AUTHENTICATION_ERROR} = require('../../../config/errors');

module.exports = async (ctx, next) => {
    try {
        const session = ctx.user.Session;

        if (!session) {
            return ctx.throw(401, AUTHENTICATION_ERROR);
        }

        const isAll = ctx.query.all === 'true';

        isAll ? await session.DeactivateAll() : await session.Deactivate();

        ctx.status = 204;

    } catch (err) {
        return ctx.throw(err.status || 500, err.message)
    }

    next();

};
