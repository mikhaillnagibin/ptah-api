'use strict';

const path = require('path');
const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const chaiValidateResponse = require('chai-validate-response');
const ObjectID = require("bson-objectid");

chai.use(chaiHttp);
chai.use(chaiValidateResponse.default);

const server = require('../../app/app');
const config = require('../../config/config');
const fakes = require('../fakes/fakes');

const routesPrefix = config.routesPrefix + config.landingsRoutesNamespace;

const openapiSchemaPath = path.resolve("./spec/openapi.yaml");

let landingsCount = 0;
let copyingLandingId = '';

describe(`POST ${routesPrefix}/copy`, () => {

    before(() => {
        return new Promise((resolve) => {
            chai.request(server)
                .get(`${routesPrefix}`)
                .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
                .end((err, res) => {
                    const landing = res.body.landings.pop();
                    landingsCount = res.body.landings.length;
                    copyingLandingId = landing._id;
                    resolve();
                });
        });
    });

    it("should return auth error for request without bearer token", (done) => {
        chai.request(server)
            .post(`${routesPrefix}/copy`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(401);
                res.type.should.eql('application/json');
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/copy`, "post")
                    .andNotifyWhen(done);
            });
    });


    it("should return bad request error if none landings id passed in body", (done) => {
        chai.request(server)
            .post(`${routesPrefix}/copy`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .send({})
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(400);
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/copy`, "post")
                    .andNotifyWhen(done);
            });
    });


    it("should return not found error if non-existent landing ids passed in body", (done) => {
        chai.request(server)
            .post(`${routesPrefix}/copy`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .send({
                ids: [ObjectID(), ObjectID()]
            })
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(404);
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/copy`, "post")
                    .andNotifyWhen(done);
            });
    });

    it("should copy success", (done) => {
        chai.request(server)
            .post(`${routesPrefix}/copy`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .send({
                ids: [copyingLandingId]
            })
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(204);
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/copy`, "post")
                    .andNotifyWhen(done);
            });
    });


    it("should increment total landings number after success copying", (done) => {
        chai.request(server)
            .get(`${routesPrefix}`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .end((err, res) => {
                res.body.landings.length.should.be.gt(landingsCount);
                done();
            });
    });


    it("should return not found error, if trying to copy landings of other user", (done) => {
        chai.request(server)
            .post(`${routesPrefix}/copy`)
            .set('authorization', `Bearer ${fakes.fakeAnotherUserAuthToken}`)
            .send({
                ids: [copyingLandingId]
            })
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(404);
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/copy`, "post")
                    .andNotifyWhen(done);
            });
    });

});
