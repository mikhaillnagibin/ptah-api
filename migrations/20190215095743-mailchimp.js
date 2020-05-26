module.exports = {
    async up(db) {
        try {
            await db.collection('ptah').rename('ptah-landings')
        } catch (err) {
            console.log('collection ptah already renamed to ptah-landings')
        }
        await db.createCollection('ptah-users')
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
