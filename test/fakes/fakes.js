'use strict';

const ObjectID = require("bson-objectid");

const fakeLandingData = require('./landing');

const fakeUserId = 'b62klDf0HeiJdNMv8K263nfE';
const fakeId = '5c4c8b46125e69048cd1bd23';

const fakeLanding = {
    _id: ObjectID(fakeId),
    name: 'My Landing Name',
    userId: fakeUserId,
    createDate: '2019-01-26T16:31:02.790Z',
    updateDate: '2019-01-26T16:31:02.790Z',
    isPublished: false,
    hasUnpublishedChanges: false,
    domain: '',
    currentVersion: 1,
    landing: fakeLandingData
};

module.exports.fakeUserId = fakeUserId;
module.exports.fakeLanding = fakeLanding;
