"use strict";

const _ = require('lodash');
const jwt = require('jsonwebtoken');
const ObjectID = require('bson-objectid');
const {Crypt, Compare} = require('password-crypt');

const REGISTRATION_SOURCE_LOCAL = 'local';
const REGISTRATION_SOURCE_GOOGLE = 'google';

function getDefaultUser() {
    const now = (new Date).toISOString();
    const id = ObjectID();
    return {
        _id: id,
        name: '',
        email: '',
        password: '',
        emailConfirmed: false,
        mailchimpIntegration: false,
        mailchimpAccessToken: '',
        registrationSource: '',
        createDate: now,
        updateDate: now,
        isDeleted: false
    }
}

class User {

    omitFields = [];

    publicFields = ['_id', 'name', 'email', 'emailConfirmed', 'mailchimpIntegration',
        'registrationSource', 'createDate', 'updateDate'];


    /*
    params.passwordSecret
    params.restorePasswordSecret
    params.restorePasswordLifetime (seconds)
    params.confirmEmailSecret
    params.confirmEmailLifetime (seconds)
     */
    constructor(ctx, collection, params) {
        params = params || {};
        if (Object.values(params).filter(Boolean).length < 5) {
            throw new Error("not enough params to init user");
        }

        this.ctx = ctx;
        this.collection = collection;
        this.params = params;
        this.user = getDefaultUser();
        return this;
    }

    async FindById(id) {
        if (!ObjectID.isValid(id)) {
            return null;
        }
        const condition = {_id: ObjectID(id)}
        return await this.find(condition);
    }

    async FindByEmail(email) {
        const condition = {email: email};
        return await this.find(condition);
    }

    GetId() {
        return this.user._id.toString();
    }

    GetUser() {
        return _.pick(this.user, this.publicFields);
    }

    async CreateUser(name, email, password, registrationSource) {

        if (!email) {
            return null;
        }
        try {
            const user = {
                name: name || '',
                email: email,
                password: await Crypt(this.params.passwordSecret, password),
                registrationSource: registrationSource  || '',
            }

            return await this.updateUser(Object.assign({}, getDefaultUser(), user));
        } catch (e) {
            throw e
        }
    }

    async CheckUserPassword(password) {
        try {
            return await Compare(this.params.passwordSecret, password, this.user.password);
        } catch (e) {
            throw e
        }
    }

    async SetNewPassword(password) {
        try {
            const user = {
                password: await Crypt(this.params.passwordSecret, password),
            }
            return await this.updateUser(user);
        } catch (e) {
            throw e
        }
    }

    async ChangeName(name) {
        try {
            return await this.updateUser({
                name: name,
            });
        } catch (e) {
            throw e
        }
    }

    async SetEmailConfirmed() {
        try {
            return await this.updateUser({
                emailConfirmed: true,
            });
        } catch (e) {
            throw e
        }
    }

    async EnableMailchimpIntegration(mailchimpAccessToken) {
        try {
            return await this.updateUser({
                mailchimpIntegration: true,
                mailchimpAccessToken: mailchimpAccessToken,
            });
        } catch (e) {
            throw e
        }
    }

    async DisableMailchimpIntegration() {
        try {
            return await this.updateUser({
                mailchimpIntegration: false,
                mailchimpAccessToken: '',
            });
        } catch (e) {
            throw e
        }
    }

    async MarkDeleted() {
        try {
            return await this.updateUser({
                isDeleted: true,
            });
        } catch (e) {
            throw e
        }
    }

    GetMailchimpIntegrationToken() {
        if (!this.user.mailchimpIntegration) {
            return '';
        }
        return this.user.mailchimpAccessToken
    }

    GetRestorePasswordToken() {
        return this.createToken(this.params.restorePasswordSecret, this.params.restorePasswordLifetime)
    }

    GetConfirmEmailToken() {
        return this.createToken(this.params.confirmEmailSecret, this.params.confirmEmailLifetime)
    }

    async FindByRestorePasswordToken(token) {
        try {
            return await this.findByToken(token, this.params.restorePasswordSecret);
        } catch (e) {
            throw e
        }
    }

    async FindByConfirmEmailToken(token) {
        try {
            return await this.findByToken(token, this.params.confirmEmailSecret);
        } catch (e) {
            throw e
        }
    }

    createToken(secret, expires) {
        const payload = {
            id: this.user._id.toString(),
            email: this.user.email,
        }
        return jwt.sign(payload, secret, {expiresIn: expires});
    }

    async findByToken(token, secret) {
        const decoded = jwt.verify(token, secret);

        const condition = {
            _id: ObjectID(decoded.id),
            email: decoded.email
        };

        await this.find(condition);
    }

    async find(conditions) {
        const options = {
            projection: {}
        };
        this.omitFields.forEach((field) => {
            options.projection[field] = 0
        });

        const defaultConditions = {
            isDeleted: false,
        };

        const query = Object.assign({}, conditions, defaultConditions)

        try {
            const result = await this.collection.findOne(query, options);

            if (!result) {
                return null;
            }

            result._id = ObjectID(result._id.toString());

            return this.fillUser(Object.assign({}, getDefaultUser(), result));

        } catch (err) {
            throw e
        }
    }

    fillUser(userObject) {
        Object.assign(this.user, userObject);
        return this.GetUser();
    }

    async updateUser(userObject) {
        try {
            userObject.updateDate = (new Date).toISOString();
            const u = this.fillUser(userObject);
            await this.collection.updateOne({_id: this.user._id}, {$set: this.user}, { upsert: true });
            return u;
        } catch (e) {
            throw e
        }
    }


}


module.exports = {
    User,
    REGISTRATION_SOURCE_LOCAL,
    REGISTRATION_SOURCE_GOOGLE,
};
