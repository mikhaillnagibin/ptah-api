'use strict';

const Router  = require('koa-router');
const convert = require('koa-convert');
const KoaBody = require('koa-body');

const config = require('../../config/config');

const listLandings = require('../actions/list-landings');
const addLanding = require('../actions/add-landing');
const getLanding = require('../actions/get-landing');
const updateLanding = require('../actions/update-landing');
const deleteLanding = require('../actions/delete-landing');
const publishLanding = require('../actions/publish-landing');
const unpublishLanding = require('../actions/unpublish-landing');
const setLandingDomain = require('../actions/set-landing-domain');
const unsetLandingDomain = require('../actions/unset-landing-domain');
const copyLandings = require('../actions/copy-landings');

const router = new Router({
    prefix: config.routesPrefix
});
const koaBody = convert(KoaBody({
    multipart: true
}));

router
    .get('/', listLandings)
    .post('/', koaBody, addLanding)
    .post('/copy', koaBody, copyLandings)
    .get('/:id', getLanding)
    .patch('/:id', koaBody, updateLanding)
    .delete('/:id', deleteLanding)
    .post('/:id/publishing', koaBody, publishLanding)
    .delete('/:id/publishing', unpublishLanding)
    .post('/:id/domain', koaBody, setLandingDomain)
    .delete('/:id/domain', unsetLandingDomain)
    ;

module.exports.routes = function () { return router.routes() };
module.exports.allowedMethods = function () { return router.allowedMethods() };
