const Redis = require('ioredis');

class RedisOauthCache {
    constructor(port, host, maxAge, keyPrefix) {
        this.keyPrefix = keyPrefix || 'OAUTH2';
        this.maxAge = maxAge || 1000000;
        this.redis = new Redis(port, host)
    }

    async get(token, ctx) {
        let data = await this.redis.get(`${this.keyPrefix}:${token}`);
        return JSON.parse(data)
    }

    async set(token, value, ctx) {
        try {
            // Use redis set EX to automatically drop expired records
            await this.redis.set(`${this.keyPrefix}:${token}`, JSON.stringify(value), 'EX', this.maxAge / 1000)
        } catch (e) {
        }
    }

    async destroy(token, ctx) {
        return await this.redis.del(`${this.keyPrefix}:${token}`)
    }
}

module.exports = RedisOauthCache;
