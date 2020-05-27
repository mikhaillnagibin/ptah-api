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

    it("should return success on remove mailchimpAccessToken and toggle mailchimpIntegration off", (done) => {
        chai.request(server)
            .delete(`${routesPrefix}`)
            .set('authorization', `Bearer ${fakes.fakeAnotherUserAuthToken}`)
            .end((err, res) => {
                should.not.exist(err);
                res.status.should.eql(200);
                res.body.mailchimpIntegration.should.be.false;
                res.should.to.be.a.validResponse(openapiSchemaPath, `${routesPrefix}`, "delete")
                    .andNotifyWhen(done);
            });
    });


});
