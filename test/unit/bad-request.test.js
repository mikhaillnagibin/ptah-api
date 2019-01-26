'use strict';

const badRequest = require('../../app/actions/helpers/bad-request');

describe('bad-request test', () => {

    it('Should return error with code 400', (done) => {
        try {
            badRequest();
        } catch (err) {
            err.status.should.be.eql(400);
            err.message.should.be.eql('Bad Request');
            done();
        }
    });
});
