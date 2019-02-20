module.exports = {
    async up(db) {
        try {
            await db.collection('ptah').rename('ptah-landings')
        } catch (err) {
            console.log('collection ptah already renamed to ptah-landings')
        }
        await db.createCollection('ptah-users', {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['userId', 'mailchimpIntegration', 'mailchimpAccessToken', 'isDeleted'],
                    properties: {
                        userId: {
                            type: 'string',
                            description: 'User id'
                        },
                        mailchimpIntegration: {
                            type: 'boolean',
                            description: 'Have user been ever integrated with mailchimp'
                        },
                        mailchimpAccessToken: {
                            type: 'string',
                            description: 'Access token, received from mailchimp on last authentication'
                        },
                        isDeleted: {
                            type: 'boolean',
                            description: 'Is user deleted or not'
                        }
                    }
                }
            },
            validationAction: 'error'
        })
    },

    async down(db) {
        try {
            await db.collection('ptah-landings').rename('ptah')
        } catch (err) {
            console.log('collection ptah-landings already renamed back to ptah')
        }
        await db.collection('ptah-users').drop()
    }
};
