/**
 * Simple sliding window rate limiter middleware.
 * Stores hit timestamps in memory keyed by client IP.
 */
export const createRateLimiter = (options) => {
    const { windowMs, max, message } = options;
    const hits = new Map();

    setInterval(() => {
        const now = Date.now();
        for (const [ip, timestamps] of hits.entries()) {
            const activeTimestamps = timestamps.filter(t => now - t < windowMs);
            if (activeTimestamps.length === 0) {
                hits.delete(ip);
            } else {
                hits.set(ip, activeTimestamps);
            }
        }
    }, windowMs * 2);

    return (req, res, next) => {
        const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        const now = Date.now();

        if (!hits.has(ip)) {
            hits.set(ip, []);
        }

        const userHits = hits.get(ip).filter(timestamp => now - timestamp < windowMs);

        if (userHits.length >= max) {
            return res.status(429).json({
                message: message || "Too many requests from this IP. Please try again later."
            });
        }

        userHits.push(now);
        hits.set(ip, userHits);
        next();
    };
};

// Pre-configured Rate Limiters driven by environment variables with fallback defaults
export const authRateLimiter = createRateLimiter({
    windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 20, // max 20 auth requests per window
    message: "Too many authentication requests from this IP. Please try again after 15 minutes."
});

export const globalRateLimiter = createRateLimiter({
    windowMs: Number(process.env.GLOBAL_RATE_LIMIT_WINDOW_MS) || 1 * 60 * 1000, // 1 minute
    max: Number(process.env.GLOBAL_RATE_LIMIT_MAX) || 100, // max 100 requests per minute
    message: "Too many requests. Please try again in a minute."
});

export default createRateLimiter;
