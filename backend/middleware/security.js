/**
 * Middleware to sanitize incoming request bodies, queries, and params
 * by removing keys that start with '$' or contain '.' to prevent NoSQL injection attacks.
 */
const nosqlSanitize = (req, res, next) => {
    const sanitize = (obj) => {
        if (obj && typeof obj === "object") {
            for (const key in obj) {
                if (key.startsWith("$") || key.includes(".")) {
                    delete obj[key];
                } else if (typeof obj[key] === "object" && obj[key] !== null) {
                    sanitize(obj[key]);
                }
            }
        }
    };

    sanitize(req.body);
    sanitize(req.query);
    sanitize(req.params);

    next();
};

export default nosqlSanitize;
