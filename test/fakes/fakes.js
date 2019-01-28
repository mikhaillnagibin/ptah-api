'use strict';

const path = require('path');
const jwt = require('jsonwebtoken');
const ObjectID = require("bson-objectid");

const config = require('../../config/config');

const fakeLandingData = require('./landing');

const fakeProjectZipPath = path.join(__dirname, 'project.zip');

const fakeUserId = 'b62klDf0HeiJdNMv8K263nfE';
const fakeUser = {
    id: fakeUserId
};
const fakeUserAuthToken = jwt.sign(fakeUser, config.jwtKey);

const fakeAnotherUserId = '0HeiJdNMv8K263nfEb62klDf';
const fakeAnotherUser = {
    id: fakeAnotherUserId
};
const fakeAnotherUserAuthToken = jwt.sign(fakeAnotherUser, config.jwtKey);


const fakeId = '5c4c8b4618cd1bd2325e6904';

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

module.exports.fakeId = fakeId;
module.exports.fakeUserId = fakeUserId;
module.exports.fakeUserAuthToken = fakeUserAuthToken;
module.exports.fakeAnotherUserAuthToken = fakeAnotherUserAuthToken;
module.exports.fakeLanding = fakeLanding;
module.exports.fakeProjectZipPath = fakeProjectZipPath;
