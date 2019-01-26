'use strict';

const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const server = require('../../app/app');
const config = require('../../config/config');

const routesPrefix = config.routesPrefix;

describe('routes', () => {

    describe(`GET ${routesPrefix}`, () => {

        it("should return response", (done) => {

            chai.request(server)
                .get(`${routesPrefix}`)
                .end((err, res) => {
                    should.not.exist(err);
                    done();
                });
        });

    });

});
