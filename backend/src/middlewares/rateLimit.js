import redis from "../lib/redis.js";

export const rateLimit = (options = {}) => {
    const {
        windowInSeconds = 60, // time window
        maxRequests = 5,     // allowed requests
        keyPrefix = "rl" ,
    } = options;
    
    return async (req, res, next) => {
        try {
            const ip = req.ip;
            const key = `${keyPrefix}:${ip}`;

            const requests = await redis.incr(key);

            if (requests === 1) {
                await redis.expire(key, windowInSeconds);
            }
            if (requests > maxRequests) {
                return res.status(429).json({
                    success: false,
                    message: "Too many requests, please try again later."
                });
            }
            next();
        } catch (error) {
            console.error("rate limiter error: ", error);
            next();
        }
    };
};


