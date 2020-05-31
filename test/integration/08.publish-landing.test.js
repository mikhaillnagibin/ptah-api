'use strict';

const fs = require('fs');
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
let landingIsPublished = false;
let landingHasUnpublishedChanges = false;
let landingDestinationDir = '';
let nginxConfigFile = '';

const fakeProjectFile = fs.readFileSync(fakes.fakeProjectZipPath);

describe(`POST ${routesPrefix}/{landingId}/publishing`, () => {

    before(() => {
        return new Promise((resolve) => {
            chai.request(server)
                .get(`${routesPrefix}`)
                .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
                .end((err, res) => {
                    const landing = res.body.landings.pop();
                    landingId = landing._id;
                    landingDomain = landing.domain;
                    landingIsPublished = landing.isPublished;
                    landingHasUnpublishedChanges = landing.hasUnpublishedChanges;
                    landingDestinationDir = path.resolve(config.landingsHtmlDir, landingId);
                    nginxConfigFile = path.resolve(config.nginxConfigsDir, `${landingId}.conf`);
                    resolve();
                });
        });
    });


    it("selected landing should not be published", (done) => {
        landingIsPublished.should.be.false;
        done();
    });


    it("should return auth error for request without bearer token", (done) => {
        chai.request(server)
            .post(`${routesPrefix}/${landingId}/publishing`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(401);
                res.type.should.eql('application/json');
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/{landingId}/publishing`, "post")
                    .andNotifyWhen(done);
            });
    });


    it("should return bad request error when none file is attached", (done) => {
        chai.request(server)
            .post(`${routesPrefix}/blah-blah-blah/publishing`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(400);
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/{landingId}/publishing`, "post")
                    .andNotifyWhen(done);
            });
    });


    it("should return bad request error when landing id is invalid", (done) => {
        chai.request(server)
            .post(`${routesPrefix}/blah-blah-blah/publishing`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .attach('file', fakeProjectFile, 'project.zip')
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(400);
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/{landingId}/publishing`, "post")
                    .andNotifyWhen(done);
            });
    });


    it("should return not found error when publish landing for another user", (done) => {
        chai.request(server)
            .post(`${routesPrefix}/${landingId}/publishing`)
            .set('authorization', `Bearer ${fakes.fakeAnotherUserAuthToken}`)
            .attach('file', fakeProjectFile, 'project.zip')
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(404);
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/{landingId}/publishing`, "post")
                    .andNotifyWhen(done);
            });
    });


    it("should return bad request error when attached file have wrong content-type", (done) => {
        chai.request(server)
            .post(`${routesPrefix}/${landingId}/publishing`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .attach('file', fakeProjectFile, 'project.jpg')
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(400);
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/{landingId}/publishing`, "post")
                    .andNotifyWhen(done);
            });
    });


    it("should return valid response on success publishing and updated flags in body", (done) => {
        chai.request(server)
            .post(`${routesPrefix}/${landingId}/publishing`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .attach('file', fakeProjectFile, 'project.zip')
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(200);
                res.body.isPublished.should.be.true;
                res.body.hasUnpublishedChanges.should.be.false;
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/{landingId}/publishing`, "post")
                    .andNotifyWhen(done);
            });
    });


    it("should place files for published landing", (done) => {
        fs.existsSync(landingDestinationDir).should.be.true;
        if (landingDomain) {
            fs.existsSync(nginxConfigFile).should.be.true;
        } else {
            fs.existsSync(nginxConfigFile).should.be.false;
        }
        done();
    });


    it("should success re-publish already published landing", (done) => {
        chai.request(server)
            .post(`${routesPrefix}/${landingId}/publishing`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .attach('file', fakeProjectFile, 'project.zip')
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(200);
                res.body.isPublished.should.be.true;
                res.body.hasUnpublishedChanges.should.be.false;
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/{landingId}/publishing`, "post")
                    .andNotifyWhen(done);
            });
    });

});
