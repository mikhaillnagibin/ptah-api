'use strict';

const _ = require('lodash');
const mongo = require('koa-mongo');

module.exports = (ctx, currentData, updatedData) => {

    const now = (new Date).toISOString();

    const defaults = {
        _id: mongo.ObjectId(),
        name: '',
        userId: ctx.state.user.id,
        createDate: now,
        updateDate: now,
        isPublished: false,
        hasUnpublishedChanges: false,
        domain: '',
        currentVersion: 0,
        landing: {}
    };

    const update = _.pick(updatedData, ['name', 'isPublished', 'domain', 'landing']);

    let data = _.defaults(currentData, defaults);

    if (update.landing && !_.isEqual(data.landing, update.landing)) {
        data.currentVersion = data.currentVersion + 1;
        data.hasUnpublishedChanges = true;
    }

    data = _.merge(data, update);

    data.updateDate = now;

    return data;

};
