'use strict';

const chai = require('chai');
const spies = require('chai-spies');

chai.use(spies);

const should = chai.should();
const expect = chai.expect;

const mongo = require('../../app/middleware/mongo');

function getNext(fn) {
    function _next() {
    }

    return chai.spy(fn || _next);
}

describe('mongo', () => {
    describe('using default options', () => {
        it('calls next function', async () => {

            const next = getNext();

            await mongo()({}, next);

            next.should.have.been.called();
        });

        it('add connection to context', async () => {
            const next = getNext();
            const ctx = {};

            await mongo()(ctx, next);

            expect(ctx.mongo).to.not.be.undefined;
            next.should.have.been.called();
        });

        it('connects using default URL', async () => {
            const next = getNext();
            const ctx = {};

            await mongo()(ctx, next);

            expect(ctx.mongo.s.url).to.be.eql('mongodb://localhost:27017/test');
            next.should.have.been.called();
        });

        it('persists an object', async () => {
            const ctx = {};

            const next = getNext(async () => {
                const collection = ctx.mongo.db('test').collection('objects');

                const sampleObject = {content: 'Just a sample object.'};

                await collection.insertOne(sampleObject);
                const retrievedObject = await collection.findOne(sampleObject);
                await collection.removeMany(sampleObject);

                expect(retrievedObject.content).to.be.eql(sampleObject.content);
            });

            await mongo()(ctx, next);
            next.should.have.been.called();
        });
    });

    describe('passing url options', () => {
        it('builds with host passed via urlOptions', async () => {
            const urlOptions = {
                host: '127.0.0.1',
            };

            const next = getNext();
            const ctx = {};

            await mongo(urlOptions)(ctx, next);

            expect(ctx.mongo.s.url).to.be.eql('mongodb://127.0.0.1:27017/test');
            next.should.have.been.called();
        });

        it('builds with port passed via urlOptions', async () => {
            const urlOptions = {
                port: '27017',
            };

            const next = getNext();
            const ctx = {};

            await mongo(urlOptions)(ctx, next);

            expect(ctx.mongo.s.url).to.be.eql('mongodb://localhost:27017/test');
            next.should.have.been.called();
        });

        it('builds with database name passed via urlOptions', async () => {
            const urlOptions = {
                databaseName: 'another-database-name',
            };

            const next = getNext();
            const ctx = {};

            await mongo(urlOptions)(ctx, next);

            expect(ctx.mongo.s.url).to.be.eql('mongodb://localhost:27017/another-database-name');
            next.should.have.been.called();
        });
    });

    describe('passing connection options', () => {
        it('connects with useNewUrlParser by default', async () => {
            const next = getNext();
            const ctx = {};

            await mongo()(ctx, next);

            expect(ctx.mongo.s.options.useNewUrlParser).to.be.ok;
            next.should.have.been.called();
        });

        it('connects with properties from connectionOptions', async () => {
            const connectionOptions = {
                useNewUrlParser: false,
            };

            const next = getNext();
            const ctx = {};

            await mongo({}, connectionOptions)(ctx, next);

            expect(ctx.mongo.s.options.useNewUrlParser).to.not.be.ok;
            next.should.have.been.called();
        });

        it('try to authenticate with credentials from connectionOptions', async () => {
            const connectionOptions = {
                auth: {
                    user: 'wrong-user',
                    password: 'wrong-password',
                },
            };

            const next = getNext();
            const ctx = {};

            try {
                await mongo({}, connectionOptions)(ctx, next);
            } catch (err) {
            } finally {
                expect(ctx.mongo).to.be.undefined;
                next.should.not.have.been.called();
            }
        });
    });

    describe('when connection fails', () => {
        const urlOptions = {
            host: 'bad-host-to-break',
        };

        it('does not calls next', async () => {
            const next = getNext();

            try {
                await mongo(urlOptions)({}, next);
            } catch (err) {

            } finally {
                next.should.not.have.been.called();
            }
        });

        it('does not assign a connection to context', async () => {
            const next = getNext();
            const ctx = {};
            try {
                await mongo(urlOptions)(ctx, next);
            } catch (err) {

            } finally {
                expect(ctx.mongo).to.be.undefined;
                next.should.not.have.been.called();
            }
        });

    });
});
