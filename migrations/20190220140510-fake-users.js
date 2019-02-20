'use strict';

/**
 * Adding a fake users for tests
 */

const ObjectID = require('bson-objectid');

const envUtils = require('../app/utils/env');
const fakes = require('../test/fakes/fakes');

const ids = [fakes.fakeUserId, fakes.fakeAnotherUserId];

module.exports = {
    async up(db) {
        if (envUtils.isTest) {

            for (let index = 0; index < ids.length; index++) {
                const userId = ids[index];
                const mailchimpIntegration = userId === fakes.fakeUserId;
                const mailchimpAccessToken = mailchimpIntegration ? Math.random().toString(36).substring(2) : '';

                const condition = {
                    userId: ids[index]
                };

                let user = await db.collection('ptah-users').findOne(condition, {});

                if (!user) {

                    user = {
                        _id: ObjectID(),
                        userId: userId,
                        mailchimpIntegration: mailchimpIntegration,
                        mailchimpAccessToken: mailchimpAccessToken,
                        isDeleted: false
                    };
                    await db.collection('ptah-users').insertOne(user);

                } else {

                    user.mailchimpIntegration = mailchimpIntegration;
                    user.mailchimpAccessToken = mailchimpAccessToken;
                    await db.collection('ptah-users').updateOne({_id: ObjectID(user._id)}, {$set: user})
                }
            }
        }
    },

    async down(db) {
        if (envUtils.isTest) {
            for (let index = 0; index < ids.length; index++) {

                const condition = {
                    userId: ids[index]
                };

                const user = await db.collection('ptah-users').findOne(condition, {});

                if (user) {
                    await db.collection('ptah-users').deleteOne({_id: ObjectID(user._id)}, true);
                }
            }
        }
    }
};
