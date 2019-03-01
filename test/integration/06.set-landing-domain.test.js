'use strict';

const path = require('path');
const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiValidateResponse = require('chai-validate-response');

chai.use(chaiHttp);
chai.use(chaiValidateResponse.default);

const should = chai.should();

const server = require('../../app/app');
const config = require('../../config/config');
const fakes = require('../fakes/fakes');

const routesPrefix = config.routesPrefix + config.landingsRoutesNamespace;

const openapiSchemaPath = path.resolve("./spec/openapi.yaml");

let landingId = '';
let landingDomain = '';
const newDomain = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + '.com';

describe(`POST ${routesPrefix}/{landingId}/domain`, () => {

    before(() => {
        return new Promise((resolve) => {
            chai.request(server)
                .get(`${routesPrefix}`)
                .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
                .end((err, res) => {
                    const landing = res.body.landings.pop();
                    landingId = landing._id;
                    landingDomain = landing.domain;
                    resolve();
                });
        });
    });


    it("selected landing should not have the same domain", (done) => {
        landingDomain.should.not.be.eql(newDomain);
        done();
    });


    it("should return auth error for request without bearer token", (done) => {
        chai.request(server)
            .post(`${routesPrefix}/${landingId}/domain`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(401);
                res.type.should.eql('application/json');
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/{landingId}/domain`, "post")
                    .andNotifyWhen(done);
            });
    });


    it("should return bad request error when landing id is invalid", (done) => {
        chai.request(server)
            .post(`${routesPrefix}/blah-blah-blah/domain`)
            .set('authorization', `Bearer ${fakes.fakeAnotherUserAuthToken}`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(400);
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/{landingId}/domain`, "post")
                    .andNotifyWhen(done);
            });
    });


    it("should return bad request when domain not passed in body", (done) => {
        chai.request(server)
            .post(`${routesPrefix}/${landingId}/domain`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(400);
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/{landingId}/domain`, "post")
                    .andNotifyWhen(done);
            });
    });

    it("should also return bad request when domain is not RFC 2181-compliant", (done) => {
        chai.request(server)
            .post(`${routesPrefix}/${landingId}/domain`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .send({
                domain: 'invalid_domain.com'
            })
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(400);
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/{landingId}/domain`, "post")
                    .andNotifyWhen(done);
            });
    });

    it("should return not found error when changing domain for another user", (done) => {
        chai.request(server)
            .post(`${routesPrefix}/${landingId}/domain`)
            .set('authorization', `Bearer ${fakes.fakeAnotherUserAuthToken}`)
            .send({
                domain: newDomain
            })
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(404);
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/{landingId}/domain`, "post")
                    .andNotifyWhen(done);
            });
    });


    it("should return valid response and new domain in body", (done) => {
        chai.request(server)
            .post(`${routesPrefix}/${landingId}/domain`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .send({
                domain: newDomain
            })
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(200);
                res.body.domain.should.eql(newDomain);
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/{landingId}/domain`, "post")
                    .andNotifyWhen(done);
            });
    });

});
