module.exports = {
  async up(db) {
    await db.collection('ptah').rename('ptah-landings');
    await db.createCollection('ptah-users');
  },

  async down(db) {
    await db.collection('ptah-landings').rename('ptah');
    await db.collection('ptah-users').drop();
  }
};
