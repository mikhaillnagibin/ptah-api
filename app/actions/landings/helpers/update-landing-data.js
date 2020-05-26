'use strict';

const _ = require('lodash');

const {AUTHENTICATION_ERROR} = require('../../../../config/errors');
const config = require('../../../../config/config');
const getDefaultLanding = require('./default-landing');

module.exports = (ctx, currentData, updatedData) => {

    currentData = currentData || {};
    updatedData = updatedData || {};

    const userId = _.get(ctx, config.userIdStatePath);
    if (!userId) {
        return ctx.throw(401, AUTHENTICATION_ERROR);
    }

    const defaults = getDefaultLanding();

    const update = _.pick(updatedData, ['name', 'isPublished', 'domain', 'landing', 'previewUrl', 'isDeleted']);

    let data = _.defaults(_.merge({}, _.omit(currentData, ['isDeleted'])), defaults);

    if (update.isPublished === true && (data.isPublished !== update.isPublished || !updatedData.hasUnpublishedChanges)) {
        data.hasUnpublishedChanges = false;
    }

    if (update.landing && !_.isEqual(data.landing, update.landing)) {
        ++data.currentVersion;
        data.hasUnpublishedChanges = true;
    }

    if (data.currentVersion === 0) {
        ++data.currentVersion;
    }

    data = _.merge({}, data, update);

    // setting current date-time here - trick for tests
    data.updateDate = defaults.updateDate;
    data.userId = userId;

    return data;

};
