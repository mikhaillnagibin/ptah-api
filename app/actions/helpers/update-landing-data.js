'use strict';

const _ = require('lodash');
const mongo = require('koa-mongo');

module.exports = (ctx, currentData, updatedData) => {

    currentData = currentData || {};
    updatedData = updatedData || {};

    const userId = _.get(ctx, 'state.user.id');
    if (!userId) {
        throw new Error('User not created');
    }

    const now = (new Date).toISOString();

    const defaults = {
        _id: mongo.ObjectId(),
        name: '',
        userId: userId,
        createDate: now,
        updateDate: now,
        isPublished: false,
        hasUnpublishedChanges: false,
        domain: '',
        currentVersion: 0,
        landing: {}
    };

    const update = _.pick(updatedData, ['name', 'isPublished', 'domain', 'landing']);

    let data = _.defaults(_.merge({}, currentData), defaults);

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

    data.updateDate = now;

    return data;

};
