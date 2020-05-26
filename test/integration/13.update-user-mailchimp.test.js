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

const routesPrefix = config.routesPrefix + config.userRoutesNamespace + '/mailchimp';

const openapiSchemaPath = path.resolve("./spec/openapi.yaml");

describe(`POST / DELETE ${routesPrefix}`, () => {

    it("should return bad request error for request with empty object in body", (done) => {
        chai.request(server)
            .post(`${routesPrefix}`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .send({})
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(400);
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}`, "post")
                    .andNotifyWhen(done);
            });
    });


    it("should return success on replace mailchimpAccessToken with new value", (done) => {
        chai.request(server)
            .post(`${routesPrefix}`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .send({
                mailchimpAccessToken: Math.random().toString(36).substring(2)
            })
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(200);
                res.body.mailchimpIntegration.should.be.true;
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}`, "post")
                    .andNotifyWhen(done);
            });
    });


    it("should return success on add mailchimpAccessToken and toggle mailchimpIntegration on", (done) => {
        chai.request(server)
            .post(`${routesPrefix}`)
            .set('authorization', `Bearer ${fakes.fakeAnotherUserAuthToken}`)
            .send({
                mailchimpAccessToken: Math.random().toString(36).substring(2)
            })
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(200);
                res.body.mailchimpIntegration.should.be.true;
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}`, "post")
                    .andNotifyWhen(done);
            });
    });


    it("should return success on remove mailchimpAccessToken and toggle mailchimpIntegration off", (done) => {
        chai.request(server)
            .delete(`${routesPrefix}`)
            .set('authorization', `Bearer ${fakes.fakeAnotherUserAuthToken}`)
            .send({
                mailchimpAccessToken: ''
            })
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(200);
                res.body.mailchimpIntegration.should.be.false;
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}`, "post")
                    .andNotifyWhen(done);
            });
    });


});
