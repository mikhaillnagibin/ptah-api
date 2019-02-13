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

const routesPrefix = config.routesPrefix + config.landingsNamespace;

const openapiSchemaPath = path.resolve("./spec/openapi.yaml");

let landingId = '';
let landingIsPublished = false;
let landingDestinationDir = '';
let nginxConfigFile = '';

describe(`DELETE ${routesPrefix}/{landingId}/publishing`, () => {

    before(() => {
        return new Promise((resolve) => {
            chai.request(server)
                .get(`${routesPrefix}`)
                .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
                .end((err, res) => {
                    const landing = res.body.landings.pop();
                    landingId = landing._id;
                    landingIsPublished = landing.isPublished;
                    landingDestinationDir = path.resolve(config.publicHtmlDir, landingId);
                    nginxConfigFile = path.resolve(config.nginxConfigsDir, `${landingId}.conf`);
                    resolve();
                });
        });
    });


    it("selected landing should be published", (done) => {
        landingIsPublished.should.be.true;
        done();
    });


    it("should return auth error for request without bearer token", (done) => {
        chai.request(server)
            .delete(`${routesPrefix}/${landingId}/publishing`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(401);
                res.type.should.eql('application/json');
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/{landingId}/publishing`, "delete")
                    .andNotifyWhen(done);
            });
    });


    it("should return bad request error when landing id is invalid", (done) => {
        chai.request(server)
            .delete(`${routesPrefix}/blah-blah-blah/publishing`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(400);
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/{landingId}/publishing`, "delete")
                    .andNotifyWhen(done);
            });
    });


    it("should return not found error when unpublish landing for another user", (done) => {
        chai.request(server)
            .delete(`${routesPrefix}/${landingId}/publishing`)
            .set('authorization', `Bearer ${fakes.fakeAnotherUserAuthToken}`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(404);
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/{landingId}/publishing`, "delete")
                    .andNotifyWhen(done);
            });
    });


    it("should return valid response on success unpublishing and updated flag in body", (done) => {
        chai.request(server)
            .delete(`${routesPrefix}/${landingId}/publishing`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(200);
                res.body.isPublished.should.be.false;
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/{landingId}/publishing`, "delete")
                    .andNotifyWhen(done);
            });
    });


    it("should remove files for published landing", (done) => {
        fs.existsSync(landingDestinationDir).should.be.false;
        fs.existsSync(nginxConfigFile).should.be.false;
        done();
    });


    it("should success re-unpublish already unpublished landing", (done) => {
        chai.request(server)
            .delete(`${routesPrefix}/${landingId}/publishing`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(200);
                res.body.isPublished.should.be.false;
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/{landingId}/publishing`, "delete")
                    .andNotifyWhen(done);
            });
    });

});