"use strict";

const ObjectID = require("bson-objectid");


module.exports = function () {
    const now = (new Date).toISOString();

    return {
        _id: ObjectID(),
        name: '',
        userId: '',
        createDate: now,
        updateDate: now,
        isPublished: false,
        hasUnpublishedChanges: false,
        domain: '',
        currentVersion: 0,
        previewUrl: '',
        isDeleted: false,
        landing: {}
    }
};
