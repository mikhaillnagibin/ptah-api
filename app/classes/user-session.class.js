"use strict";

const _ = require('lodash');
const jwt = require('jsonwebtoken');
const ObjectID = require('bson-objectid');

function getDefaultUserSession() {
    const now = (new Date).toISOString();
    return {
        _id: ObjectID(),
        userId: '',
        accessToken: '',
        refreshToken: '',
        ip: '',
        userAgent: '',
        isActive: true,
        createdAt: now,
        updatedAt: now,
        expiresAt: now,
    }
}

class UserSession {

    publicFields = ['userId', 'accessToken', 'refreshToken', 'expiresAt'];

    /**
     * params.authTokenSecret
     * params.accessTokenLifetime
     * params.refreshTokenLifetime
     * params.authCheckUserAgent
     * params.authCheckIP
     */
    constructor(ctx, collection, params) {
        params = params || {}
        params.authCheckUserAgent = !!params.authCheckUserAgent;
        params.authCheckIP = !!params.authCheckIP;

        if (!params.authTokenSecret || !params.accessTokenLifetime || !params.refreshTokenLifetime) {
            throw new Error("not enough params to init user session");
        }

        this.ctx = ctx;
        this.collection = collection;
        this.params = params;
        this.session = getDefaultUserSession();
        return this;
    }

    async FindByAccessToken(token, ip, userAgent) {
        return this.findByToken('accessToken', token, ip, userAgent);
    }

    async FindByRefreshToken(token, ip, userAgent) {
        return this.findByToken('refreshToken', token, ip, userAgent);
    }

    async FindByUserId(id) {
        const condition = {userId: ObjectID(id)};
        return await this.find(condition);
    }

    GetSession() {
        return _.pick(this.session, this.publicFields);
    }

    async Refresh(userId, ip, userAgent) {
        return await this.createOrRefresh(userId, ip, userAgent, false)
    }

    async Create(userId, ip, userAgent) {

        // try to re-use existing session

        const condition = {
            userId: userId,
        };
        if (this.params.authCheckIP && ip) {
            condition.ip = ip;
        }
        if (this.params.authCheckUserAgent && userAgent) {
            condition.userAgent = userAgent;
        }

        const s = await this.find(condition);

        if (s) {
            try {
                jwt.verify(this.session.accessToken, this.params.authTokenSecret);
                return s;
            } catch (e) {
                // do nothing - accessToken in saved session is expired
            }
        }

        return await this.createOrRefresh(userId, ip, userAgent, true)
    }

    async Deactivate() {
        try {
            return await this.updateSession({isActive: false});
        } catch (e) {
            throw e
        }
    }

    async DeactivateAll() {
        try {
            const filter = {
                userId: this.session.userId,
                isActive: true,
            };

            const update = {
                isActive: false,
                updatedAt: (new Date).toISOString()
            }

            await this.collection.updateMany(filter, {$set: update});

        } catch (err) {
            throw err
        }
    }

    async createOrRefresh(userId, ip, userAgent, isCreate) {
        if (!userId) {
            throw new Error('cant_create_auth')
        }
        try {
            const accessToken = this.createToken(userId, ip, userAgent, this.params.accessTokenLifetime);

            const refreshToken = this.createToken(userId, ip, userAgent, this.params.refreshTokenLifetime)

            const session = {
                userId: userId,
                accessToken: accessToken,
                refreshToken: refreshToken,
                ip: this.params.authCheckIP ? ip : '',
                userAgent: this.params.authCheckUserAgent ? userAgent : '',
                isActive: true,
                expiresAt: this.getExpDate(),
            }

            const defaults = isCreate ? getDefaultUserSession() : {};

            return await this.updateSession(Object.assign({}, defaults, session));
        } catch (e) {
            throw e
        }
    }

    createToken(userId, ip, userAgent, expires) {
        const payload = {
            userId: userId,
            ip: this.params.authCheckIP ? ip : '',
            userAgent: this.params.authCheckUserAgent ? userAgent : '',
        }
        return jwt.sign({payload}, this.params.authTokenSecret, {expiresIn: expires});
    }

    getExpDate() {
        const expDate = new Date();
        expDate.setSeconds(expDate.getSeconds() + this.params.refreshTokenLifetime);
        return expDate;
    }

    async findByToken(tokenType, token, ip, userAgent) {
        try {
            const decoded = jwt.verify(token, this.params.authTokenSecret);

            const condition = {};
            condition[tokenType] = token
            if (this.params.authCheckIP && ip) {
               condition.ip = ip;
            }
            if (this.params.authCheckUserAgent && userAgent) {
               condition.userAgent = userAgent;
            }

            const s = await this.find(condition);

            if (!s) {
                return null;
            }

            if (s.userId !== decoded.payload.userId ||
                (this.params.authCheckIP && ip !== decoded.payload.ip) ||
                (this.params.authCheckUserAgent && userAgent !== decoded.payload.userAgent)) {

                return null
            }

            return s;

        } catch (e) {
            this.ctx.log.error(e);
            return null;
        }
    }

    async find(conditions) {
        const options = {};

        const defaultConditions = {
            isActive: true,
            expiresAt: {$gt: new Date()},
        };

        const query = Object.assign({}, conditions, defaultConditions)

        try {
            const result = await this.collection.findOne(query, options);

            if (!result) {
                return null;
            }

            return this.fillSession(Object.assign({}, getDefaultUserSession(), result));

        } catch (err) {
            throw e
        }
    }

    fillSession(sessionObject) {
        Object.assign(this.session, sessionObject);
        return this.GetSession();
    }

    async updateSession(sessionObject) {
        try {
            sessionObject.updatedAt = (new Date).toISOString();
            delete sessionObject._id;
            await this.collection.updateOne({_id: this.session._id}, {$set: sessionObject}, {upsert: true})
            return this.fillSession(sessionObject);
        } catch (e) {
            throw e
        }
    }

}


module.exports = {
    UserSession,
};
