module.exports = {
  async up(db) {
    await db.createCollection('ptah');
  },

  async down(db) {
    await db.ptah.drop();
  }
};
