'use strict';

const request = require('request-promise-native');

module.exports = async (ctx, options) => {
    const label = Math.random().toString(36).substring(2);
    try {
        ctx.log.info(`[${label}]`, 'Sending http request to mailchimp:', options.uri);
        ctx.log.debug(`[${label}]`, 'Sending http request to mailchimp with params:', options);
        const result = await request(options);
        if (result.error) {
            return throwError(ctx, label, result);
        }
        ctx.log.info(`[${label}]`, 'Sending http request to mailchimp success:');
        ctx.log.debug(`[${label}]`, 'Sending http request to mailchimp success:', result);
        return result;
    } catch(err) {
        return throwError(ctx, label, err);
    }
};

function throwError(ctx, label, err) {
    if (!err.logged) {
        const response = err.response && err.response.body ? err.response.body : err;
        ctx.log.error(`[${label}]`, 'Sending http request to mailchimp error:', response);
        ctx.log.debug(`[${label}]`, 'Sending http request to mailchimp error1:', err);
        if (err.statusCode === 401 || err.error === 'invalid_token') {
            const error = new Error('Precondition failed');
            error.status = 412;
            error.logged = true;
            throw error;
        }
        if (err.statusCode) {
            err.status = err.statusCode;
        }
        err.logged = true;
    }
    throw err;
}
