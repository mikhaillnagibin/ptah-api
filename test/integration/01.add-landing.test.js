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

const routesPrefix = config.routesPrefix + config.landingsRoutesNamespace;

const openapiSchemaPath = path.resolve("./spec/openapi.yaml");

describe(`POST ${routesPrefix}`, () => {

    it("should return auth error for request without bearer token", (done) => {
        chai.request(server)
            .post(`${routesPrefix}`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(401);
                res.type.should.eql('application/json');
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}`, "post")
                    .andNotifyWhen(done);
            });
    });


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


    it("should return bad request error for request with only name in body", (done) => {
        chai.request(server)
            .post(`${routesPrefix}`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .send({
                name: "My new landing"
            })
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(400);
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}`, "post")
                    .andNotifyWhen(done);
            });
    });


    it("and should return bad request error for request with only landing in body", (done) => {
        chai.request(server)
            .post(`${routesPrefix}`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .send({
                landing: fakes.fakeLanding.landing
            })
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(400);
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}`, "post")
                    .andNotifyWhen(done);
            });
    });


    it("also should return bad request error if landing is empty object", (done) => {
        chai.request(server)
            .post(`${routesPrefix}`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .send({
                name: "My new landing",
                landing: {}
            })
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(400);
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}`, "post")
                    .andNotifyWhen(done);
            });
    });


    it("should return 201 code for request with full body", (done) => {
        chai.request(server)
            .post(`${routesPrefix}`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .send({
                name: "My new landing",
                landing: fakes.fakeLanding.landing
            })
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(201);
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}`, "post")
                    .andNotifyWhen(done);
            });
    });

});
