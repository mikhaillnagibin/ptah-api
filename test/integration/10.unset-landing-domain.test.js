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

const routesPrefix = config.routesPrefix + config.landingsNamespace;

const openapiSchemaPath = path.resolve("./spec/openapi.yaml");

let landingId = '';
let landingDomain = '';

describe(`DELETE ${routesPrefix}/{landingId}/domain`, () => {

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


    it("selected landing should have domain", (done) => {
        landingDomain.should.not.be.eql('');
        done();
    });


    it("should return auth error for request without bearer token", (done) => {
        chai.request(server)
            .delete(`${routesPrefix}/${landingId}/domain`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(401);
                res.type.should.eql('application/json');
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/{landingId}/domain`, "delete")
                    .andNotifyWhen(done);
            });
    });


    it("should return bad request error when landing id is invalid", (done) => {
        chai.request(server)
            .delete(`${routesPrefix}/blah-blah-blah/domain`)
            .set('authorization', `Bearer ${fakes.fakeAnotherUserAuthToken}`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(400);
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/{landingId}/domain`, "delete")
                    .andNotifyWhen(done);
            });
    });


    it("should return not found error when changing domain for another user", (done) => {
        chai.request(server)
            .delete(`${routesPrefix}/${landingId}/domain`)
            .set('authorization', `Bearer ${fakes.fakeAnotherUserAuthToken}`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(404);
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/{landingId}/domain`, "delete")
                    .andNotifyWhen(done);
            });
    });


    it("should return valid response and empty domain in body", (done) => {
        chai.request(server)
            .delete(`${routesPrefix}/${landingId}/domain`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(200);
                res.body.domain.should.eql('');
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/{landingId}/domain`, "delete")
                    .andNotifyWhen(done);
            });
    });






});