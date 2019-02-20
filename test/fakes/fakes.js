'use strict';

const path = require('path');
const ObjectID = require("bson-objectid");

const fakeLandingData = require('./landing');
const fakeMaillistData = require('./maillists');

const fakeProjectZipPath = path.join(__dirname, 'project.zip');

const fakeUserId = 'b62klDf0HeiJdNMv8K263nfE';
const fakeUserAuthToken = 't9t8yf_-A9IbFJ-ldxoQ80pWBDbRWhDiuNIlhj1nl7I.OFol83LbiTznkEJzwz0otoO5Zn8KDlGONGiKdqrgawM';

const fakeAnotherUserId = '0HeiJdNMv8K263nfEb62klDf';
const fakeAnotherUserAuthToken = 'CunLhcgaE-tz6euizyof-ltm1Hh88lrDTcbj8KVoPH4.hnts7D3ufK_ERbujTrUyFpHXUQMdy9GBvYUH7Y3xKeI';


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
