'use strict';

const path = require('path');
const ObjectID = require("bson-objectid");

const fake_users = require('./fake_users');
const fakeLandingData = require('./landing');
const fakeMaillistData = require('./maillists');

const fakeProjectZipPath = path.join(__dirname, 'project.zip');

const fakeUserId = fake_users[0]._id;
const fakeUserAuthToken = fake_users[0].accessToken;

const fakeAnotherUserId = fake_users[1]._id;
const fakeAnotherUserAuthToken = fake_users[1].accessToken;

const fakeId = '5c4c8b4618cd1bd2325e6904';

const fakeLanding = {
    _id: ObjectID(fakeId),
    name: 'My Landing Name',
    previewUrl: 'http://domain.com/image/preview.png',
    userId: fakeUserId,
    createDate: '2019-01-26T16:31:02.790Z',
    updateDate: '2019-01-26T16:31:02.790Z',
    isPublished: false,
    hasUnpublishedChanges: false,
    domain: '',
    currentVersion: 1,
    isDeleted: false,
    landing: fakeLandingData
};

module.exports.fakeId = fakeId;
module.exports.fakeUserId = fakeUserId;
module.exports.fakeUserAuthToken = fakeUserAuthToken;
module.exports.fakeAnotherUserId = fakeAnotherUserId;
module.exports.fakeAnotherUserAuthToken = fakeAnotherUserAuthToken;
module.exports.fakeLanding = fakeLanding;
module.exports.fakeMaillistData = fakeMaillistData;
module.exports.fakeProjectZipPath = fakeProjectZipPath;
