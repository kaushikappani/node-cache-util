const redis = require("redis");
const util = require('util');

class RedisCacheUtil {
    constructor(redisUrl, ttl, keyFunction) {
        this.client = redis.createClient({ url: redisUrl, legacyMode: true });
        this.ttl = ttl;
        this.keyFunction = keyFunction;

        this.client.on('error', (err) => {
            console.error('Redis client error:', err);
        });
        this.client.on("ready", () => console.log("redis connected from module"));
        this.client.connect();
    }

    cache() {
        return async (req, res, next) => {
            const key = this.keyFunction(req);
            try {
                const getAsync = util.promisify(this.client.get).bind(this.client);

                const cachedData = await getAsync(key);
                if (cachedData) {
                    res.json(JSON.parse(cachedData));
                } else {
                    const originalSend = res.send.bind(res);
                    res.send = async (body) => {
                        await this.client.setEx(key, this.ttl, body);
                        originalSend(body);
                    };
                    next();
                }
            } catch (err) {
                console.error('Redis middleware error:', err);
                next();
            }
        };
    }
    async remove(keys) {
        try {
            const delAsync = util.promisify(this.client.del).bind(this.client);
            const result = await delAsync(keys);
            console.log(`Deleted ${result} keys`);
            return result;
        } catch (err) {
            console.error('Redis delete error:', err);
            throw err;
        }
    }
  
}

module.exports = RedisCacheUtil;