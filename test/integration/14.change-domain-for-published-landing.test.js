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
const newDomain = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + '.com';
const renewDomain = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 11) + '.net';

const fakeProjectFile = fs.readFileSync(fakes.fakeProjectZipPath);

describe('Changing domain for already published landing', () => {

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
                    landingDestinationDir = path.resolve(config.publicHtmlDir, landingId);
                    nginxConfigFile = path.resolve(config.nginxConfigsDir, `${landingId}.conf`);
                    resolve();
                });
        });
    });


    it("selected landing should not be published yet", (done) => {
        landingIsPublished.should.be.false;
        done();
    });


    it("also, selected landing should not have domain", (done) => {
        landingDomain.should.be.empty;
        done();
    });


    it("should publish success and updated flags in body", (done) => {
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


    it("should place files only for published landing content, not domain config", (done) => {
        fs.existsSync(landingDestinationDir).should.be.true;
        fs.existsSync(nginxConfigFile).should.be.false;
        done();
    });


    it("should successfully set new domain", (done) => {
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


    it("should place domain config file", (done) => {
        fs.existsSync(nginxConfigFile).should.be.true;
        const configContent = fs.readFileSync(nginxConfigFile).toString('utf8');
        configContent.indexOf(`server_name ${newDomain};`).should.be.gte(0);
        configContent.indexOf(`server_name ${renewDomain};`).should.be.eq(-1);
        done();
    });



    it("should successfully change domain", (done) => {
        chai.request(server)
            .post(`${routesPrefix}/${landingId}/domain`)
            .set('authorization', `Bearer ${fakes.fakeUserAuthToken}`)
            .send({
                domain: renewDomain
            })
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(200);
                res.body.domain.should.eql(renewDomain);
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}/{landingId}/domain`, "post")
                    .andNotifyWhen(done);
            });
    });


    it("should also change domain in config file", (done) => {
        fs.existsSync(nginxConfigFile).should.be.true;
        const configContent = fs.readFileSync(nginxConfigFile).toString('utf8');
        configContent.indexOf(`server_name ${newDomain};`).should.be.eq(-1);
        configContent.indexOf(`server_name ${renewDomain};`).should.be.gte(0);
        done();
    });


    it("should successfully remove domain", (done) => {
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


    it("should remove domain config file but landing content should be published", (done) => {
        fs.existsSync(landingDestinationDir).should.be.true;
        fs.existsSync(nginxConfigFile).should.be.false;
        done();
    });


    it("should successfully unpublish landing", (done) => {
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


    it("should remove all files for published landing", (done) => {
        fs.existsSync(nginxConfigFile).should.be.false;
        fs.existsSync(landingDestinationDir).should.be.false;
        done();
    });


});
