import jwt from "jsonwebtoken";

const protect = (req, res, next) => {

    try {
        let token = null;

        // Parse cookies manually to avoid external packages
        if (req.headers.cookie) {
            const cookies = req.headers.cookie.split(";");
            for (let cookie of cookies) {
                const [name, val] = cookie.trim().split("=");
                if (name === "token") {
                    token = val;
                    break;
                }
            }
        }

        // Fallback to Authorization Header
        if (!token && req.headers.authorization) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                message: "No Token Provided"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid Token"
        });
    }

};

export default protect;