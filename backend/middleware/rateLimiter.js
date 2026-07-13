/**
 * Simple sliding window rate limiter middleware.
 * Stores hit timestamps in memory keyed by client IP.
 */
const rateLimiter = (options) => {
    const { windowMs, max, message } = options;
    const hits = new Map();

    // Periodically clean up memory for inactive IPs
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

        // Filter out timestamps older than the sliding window
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

export default rateLimiter;
