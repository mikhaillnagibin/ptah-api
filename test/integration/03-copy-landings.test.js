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

const routesPrefix = config.routesPrefix;

const openapiSchemaPath = path.resolve("./spec/openapi.yaml");

let landingsCount = 0;
let copyingLandingId = '';

describe(`POST ${routesPrefix}/copy`, () => {

    it("should return auth error for request without bearer token", (done) => {
        chai.request(server)
            .post(`${routesPrefix}/copy`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(401);
                res.type.should.eql('application/json');
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/copy`, "post").andNotifyWhen(done);
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
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/copy`, "post").andNotifyWhen(done);
            });
    });


    it("should return not found error if none landings id passed in body", (done) => {
        chai.request(server)
            .post(`${routesPrefix}/copy`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .send({
                ids: ["5c4efd03176fd321ecfc4fb2", "5c4ef95a07755539f4dc1c53"]
            })
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(404);
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/copy`, "post").andNotifyWhen(done);
            });
    });

    before(() => {
        chai.request(server)
            .get(`${routesPrefix}`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .end((err, res) => {
                landingsCount = res.body.landings.length;
                copyingLandingId = res.body.landings[0]._id;
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

                chai.request(server)
                    .get(`${routesPrefix}`)
                    .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
                    .end((_err, _res) => {
                        _res.body.landings.length.should.eql(landingsCount + 1);
                    });

                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/copy`, "post").andNotifyWhen(done);
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
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/copy`, "post").andNotifyWhen(done);
            });
    });



});
