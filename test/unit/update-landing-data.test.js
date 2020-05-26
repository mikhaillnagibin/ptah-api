'use strict';

const _ = require('lodash');
const chai = require('chai');
const should = chai.should();

const fakes = require('../fakes/fakes');
const config = require('../../config/config');

const updateLandingData = require('../../app/actions/landings/helpers/update-landing-data');

const fakeCtx = {};
_.set(fakeCtx, config.userIdStatePath, fakes.fakeUserId);


describe('update-landing-data test', () => {

    it('Should return error when called without params', (done) => {
        try {
            updateLandingData();
        } catch (err) {
            done();
        }
    });


    it('Should return error when called without user in ctx', (done) => {
        try {
            updateLandingData({state: {}});
        } catch (err) {
            done();
        }
    });


    it('Should return object with defaults when called without landing params', (done) => {

        const data = updateLandingData(fakeCtx);

        data._id.should.be.an('object');
        data._id.should.be.not.empty;
        data.name.should.eql('');
        data.previewUrl.should.eql('');
        data.userId.should.eql(fakes.fakeUserId);
        data.createDate.should.be.a('string');
        data.createDate.should.be.not.empty;
        data.updateDate.should.be.eql(data.createDate);
        data.isPublished.should.be.false;
        data.hasUnpublishedChanges.should.be.false;
        data.domain.should.eql('');
        data.currentVersion.should.eql(1);
        data.landing.should.be.an('object');
        data.landing.should.be.empty;

        done();
    });


    it('Should return the same landing when called with landing param', (done) => {

        const excludes = ['updateDate'];

        const data = updateLandingData(fakeCtx, fakes.fakeLanding);

        _.omit(data, excludes).should.be.deep.equal(_.omit(fakes.fakeLanding, excludes));

        done();
    });


    it('Should not replace landing with empty object on update', (done) => {

        const data = updateLandingData(fakeCtx, fakes.fakeLanding, {
            landing: {}
        });

        data.landing.should.not.be.deep.equal({});

        done();
    });


    it('Should increment version when updates a landing', (done) => {

        const data = updateLandingData(fakeCtx, fakes.fakeLanding, {
            landing: {
                "slug": "MyNewLanding",
            }
        });

        data.currentVersion.should.be.eql(fakes.fakeLanding.currentVersion + 1);

        done();
    });


    it('Should not increment version when updates landing is the same landing', (done) => {

        const data = updateLandingData(fakeCtx, fakes.fakeLanding, {
            landing: fakes.fakeLanding.landing
        });

        data.currentVersion.should.be.eql(fakes.fakeLanding.currentVersion);

        done();
    });


    it('Should set hasUnpublishedChanges flag to true when updates a landing', (done) => {

        const data = updateLandingData(fakeCtx, fakes.fakeLanding, {
            landing: {
                "slug": "MyNewLanding",
            }
        });

        fakes.fakeLanding.hasUnpublishedChanges.should.be.false;
        data.hasUnpublishedChanges.should.be.true;

        done();
    });


    it('Should update domain, when it passed', (done) => {

        const domain = 'test.com';

        const data = updateLandingData(fakeCtx, fakes.fakeLanding, {
            domain: domain
        });

        fakes.fakeLanding.domain.should.be.empty;
        data.domain.should.be.eql(domain);

        done();
    });


    it('Should clear domain, when it passed as empty string', (done) => {

        const domain = 'test.com';

        const fakeLanding = _.cloneDeep(fakes.fakeLanding);
        fakeLanding.domain = domain;

        const data = updateLandingData(fakeCtx, fakeLanding, {
            domain: ''
        });

        fakeLanding.domain.should.be.eql(domain);
        data.domain.should.be.eql('');

        done();
    });


    it('Should set isPublished flag to true when updates an isPublished flag', (done) => {

        const data = updateLandingData(fakeCtx, fakes.fakeLanding, {
            isPublished: true
        });

        fakes.fakeLanding.isPublished.should.be.false;
        data.isPublished.should.be.true;

        done();
    });


    it('Should set isPublished flag to false when updates an isPublished flag', (done) => {

        const fakeLanding = _.cloneDeep(fakes.fakeLanding);
        fakeLanding.isPublished = true;

        const data = updateLandingData(fakeCtx, fakeLanding, {
            isPublished: false
        });

        fakeLanding.isPublished.should.be.true;
        data.isPublished.should.be.false;

        done();
    });


    it('Should update name, when it passed', (done) => {

        const name = 'My second landing';

        const data = updateLandingData(fakeCtx, fakes.fakeLanding, {
            name: name
        });

        fakes.fakeLanding.domain.should.not.be.eql(name);
        data.name.should.be.eql(name);

        done();
    });

    it('Should update previewUrl, when it passed', (done) => {

        const previewUrl = 'http://domain.com/image/preview.png';

        const data = updateLandingData(fakeCtx, fakes.fakeLanding, {
            previewUrl: previewUrl
        });

        fakes.fakeLanding.domain.should.not.be.eql(previewUrl);
        data.previewUrl.should.be.eql(previewUrl);

        done();
    });


    it('Should not update or create other top-level properties, even they passed', (done) => {
        const wrongId = 'wrongId';
        const wrongUserId = 'wrongUserId';
        const wrongCreateDate = '2011-11-11T16:31:02.790Z';
        const wrongUpdateDate = '2012-12-12T16:31:02.790Z';
        const wrongCurrentVersion = 999;

        const data = updateLandingData(fakeCtx, fakes.fakeLanding, {
            _id: wrongId,
            userId: wrongUserId,
            createDate: wrongCreateDate,
            updateDate: wrongUpdateDate,
            currentVersion: wrongCurrentVersion,
            someWrongProperty: 'blah-blah-blah'
        });

        data._id.should.not.be.eql(wrongId);
        data.userId.should.not.be.eql(wrongUserId);
        data.createDate.should.not.be.eql(wrongCreateDate);
        data.updateDate.should.not.be.eql(wrongUpdateDate);
        data.currentVersion.should.not.be.eql(wrongCurrentVersion);
        data.should.not.have.property('someWrongProperty');

        done();
    });
});
