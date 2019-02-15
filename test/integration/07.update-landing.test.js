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
let landingFull = {};
let currentVersion = 0;

const landingNewName = `My landing new name is ${(new Date).toISOString()}`;

const landingNewSlug = `New slug ${Math.random()}`;

describe(`PATCH ${routesPrefix}/{landingId}`, () => {

    before(() => {
        return new Promise((resolve) => {
            chai.request(server)
                .get(`${routesPrefix}`)
                .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
                .end((err, res) => {
                    const landing = res.body.landings.pop();
                    landingId = landing._id;

                    chai.request(server)
                        .get(`${routesPrefix}/${landingId}`)
                        .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
                        .end((err, res) => {
                            landingFull = res.body;
                            currentVersion = landingFull.currentVersion;
                            resolve();
                        });
                });
        });
    });


    it("selected landing should not have the same name or slug", (done) => {
        landingFull.name.should.not.be.eql(landingNewName);
        landingFull.landing.slug.should.not.be.eql(landingNewSlug);
        done();
    });


    it("should return auth error for request without bearer token", (done) => {
        chai.request(server)
            .patch(`${routesPrefix}/${landingId}`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(401);
                res.type.should.eql('application/json');
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/{landingId}`, "patch")
                    .andNotifyWhen(done);
            });
    });


    it("should return bad request error when landing id is invalid", (done) => {
        chai.request(server)
            .patch(`${routesPrefix}/blah-blah-blah`)
            .set('authorization', `Bearer ${fakes.fakeAnotherUserAuthToken}`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(400);
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/{landingId}`, "patch")
                    .andNotifyWhen(done);
            });
    });


    it("should return not found when no data not passed in body", (done) => {
        chai.request(server)
            .patch(`${routesPrefix}/${landingId}`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(400);
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/{landingId}`, "patch")
                    .andNotifyWhen(done);
            });
    });


    it("should return not found error when updating landing for another user", (done) => {
        chai.request(server)
            .patch(`${routesPrefix}/${landingId}`)
            .set('authorization', `Bearer ${fakes.fakeAnotherUserAuthToken}`)
            .send({
                name: landingNewName,
                landing: {
                    slug: landingNewSlug
                },
                baseVersion: currentVersion
            })
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(404);
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/{landingId}`, "patch")
                    .andNotifyWhen(done);
            });
    });


    it("should return Precondition Failed error if base version does not match current", (done) => {
        chai.request(server)
            .patch(`${routesPrefix}/${landingId}`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .send({
                name: landingNewName,
                landing: {
                    slug: landingNewSlug
                },
                baseVersion: -1
            })
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(412);
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/{landingId}`, "patch")
                    .andNotifyWhen(done);
            });
    });


    it("should return valid response with new name in body and incremented current version", (done) => {
        chai.request(server)
            .patch(`${routesPrefix}/${landingId}`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .send({
                name: landingNewName,
                landing: {
                    slug: landingNewSlug
                },
                baseVersion: currentVersion
            })
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(200);
                res.body.name.should.eq(landingNewName);
                res.body.currentVersion.should.be.eql(currentVersion + 1);
                res.body.hasUnpublishedChanges.should.be.true;
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/{landingId}`, "patch")
                    .andNotifyWhen(done);
            });
    });


    it("updated landing should have the new name and slug and incremented current version", (done) => {
        chai.request(server)
            .get(`${routesPrefix}/${landingId}`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .end((err, res) => {
                res.body.name.should.be.eql(landingNewName);
                res.body.currentVersion.should.be.eql(currentVersion + 1);
                res.body.landing.slug.should.be.eql(landingNewSlug);
                res.body.hasUnpublishedChanges.should.be.true;
                done();
            });

    });

});