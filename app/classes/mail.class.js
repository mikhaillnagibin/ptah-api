"use strict";

const postmark = require("postmark");

const {INTERNAL_SERVER_ERROR, PRECONDITION_FAILED} = require('../../config/errors');

class Mail {
    /*
    params.emailPostmarkToken
    params.emailSenderFrom
    params.publicHost
     */
    constructor(ctx, params, templates) {
        params = params || {};
        if (Object.values(params).filter(Boolean).length < 3) {
            throw new Error("not enough params to init mail");
        }

        this.ctx = ctx;
        this.params = params;
        this.templates = templates;
        this.client = new postmark.ServerClient(params.emailPostmarkToken);

        return this;
    }

    async SendRestorePasswordRequest(user, token) {
        const templateId = this.templates.emailTemplateRestorePasswordRequest || '';

        const templateData = Object.assign({}, user, {
            token: token,
            publicHost: this.params.publicHost,
        })

        return this.sendEmailWithTemplate(user.email, templateId, templateData);
    }

    async SendRestorePassword(user, password) {
        const templateId = this.templates.emailTemplateRestorePassword || '';

        const templateData = Object.assign({}, user, {
            password: password,
        })

        return this.sendEmailWithTemplate(user.email, templateId, templateData);
    }

    async SendEmailConfirmation(user, token) {
        const templateId = this.templates.emailTemplateConfirmEmail || '';

        const templateData = Object.assign({}, user, {
            token: token,
            publicHost: this.params.publicHost,
        })

        return this.sendEmailWithTemplate(user.email, templateId, templateData);
    }

    async SendUserSignupLocal(user, token) {
        const templateId = this.templates.emailTemplateUserSignupLocal || '';

        const templateData = Object.assign({}, user, {
            token: token,
            publicHost: this.params.publicHost,
        })

        return this.sendEmailWithTemplate(user.email, templateId, templateData);
    }

    async SendUserSignupSocial(user, password) {
        const templateId = this.templates.emailTemplateUserSignupLocal || '';

        const templateData = Object.assign({}, user, {
            password: password,
            publicHost: this.params.publicHost,
        })

        return this.sendEmailWithTemplate(user.email, templateId, templateData);
    }

    async sendEmailWithTemplate(to, templateId, templateData) {
        if (!to) {
            if (this.ctx) {
                this.ctx.throw(412, PRECONDITION_FAILED)
            } else {
                throw new Error(PRECONDITION_FAILED);
            }
        }
        if (!templateId) {
            if (this.ctx) {
                this.ctx.throw(500, INTERNAL_SERVER_ERROR)
            } else {
                throw new Error(INTERNAL_SERVER_ERROR);
            }
        }
        try {
            return await this.client.sendEmailWithTemplate({
                TemplateId: templateId,
                From: this.params.emailSenderFrom,
                To: to,
                TemplateModel: templateData
            });
        } catch (err) {
            if (this.ctx) {
                this.ctx.throw(500, INTERNAL_SERVER_ERROR)
            } else {
                throw err;
            }
        }
    }
}


module.exports = {
    Mail
};
