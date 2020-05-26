'use strict';

const path = require('path');
const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const chaiValidateResponse = require('chai-validate-response');

chai.use(chaiHttp);
chai.use(chaiValidateResponse.default);

const server = require('../../app/app');
const config = require('../../config/config');
const fakes = require('../fakes/fakes');

const routesPrefix = config.routesPrefix + config.mailchimpRoutesNamespace + '/maillists';

const openapiSchemaPath = path.resolve("./spec/openapi.yaml");

describe(`GET ${routesPrefix}`, () => {


    it("should return auth error for request without bearer token", (done) => {
        chai.request(server)
            .get(`${routesPrefix}`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(401);
                res.type.should.eql('application/json');
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}`, "get")
                    .andNotifyWhen(done);
            });
    });

    it("should return alid response for authenticated user, that integrated with mailchimp", (done) => {
        chai.request(server)
            .get(`${routesPrefix}`)
            .set('authorization', `Bearer ${fakes.fakeAnotherUserAuthToken}`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(200);
                res.body.should.deep.eql(fakes.fakeMaillistData);
                done()
            });
    });


    it("should return 412 error for authenticated another user, that not integrated with mailchimp", (done) => {
        chai.request(server)
            .get(`${routesPrefix}`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(412);
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}`, "get")
                    .andNotifyWhen(done);
            });
    });

});
