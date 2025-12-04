import redis from "../lib/redis.js";
export const rateLimit = (options = {}) => {
    const {
        windowInSeconds = 60,
        maxRequests = 5,
        keyPrefix = "rl",
    } = options;

    return async (req, res, next) => {
        try {
            const ip = req.ip;
            const key = `${keyPrefix}:${ip}`;

            const requests = await redis.incr(key);

            if (requests === 1) {
                redis.expire(key, windowInSeconds); // no await needed
            }

            if (requests > maxRequests) {
                return res.status(429).json({
                    success: false,
                    message: "Too many requests. Try again later.",
                });
            }

            next();
        } catch (error) {
            console.error("Rate limiter error:", error);
            next();
        }
    };
};



