module.exports = {
    async up(db) {
        await db.collection('ptah-users').createIndexes([
                {
                    "key": {
                        "email": 1
                    },
                    "name": "email_idx",
                    "unique": true
                },
                {
                    "key": {
                        "isDeleted": 1
                    },
                    "name": "isDeleted_idx",
                },
            ]
        );
        await db.createCollection('ptah-users-sessions');
        await db.collection('ptah-users-sessions').createIndexes([
                {
                    "key": {
                        "userId": 1
                    },
                    "name": "userId_idx",
                },
                {
                    "key": {
                        "accessToken": 1
                    },
                    "name": "at_idx",
                    "unique": true
                },
                {
                    "key": {
                        "refreshToken": 1
                    },
                    "name": "rt_idx",
                    "unique": true
                },
                {
                    "key": {
                        "isActive": 1
                    },
                    "name": "isActive_idx",
                },
            ]
        );
    },
    async down(db) {
        await db.collection('ptah-users').dropIndexes()
        await db.collection('ptah-users-sessions').dropIndexes()
        await db.collection('ptah-users-sessions').drop()
    }
};

