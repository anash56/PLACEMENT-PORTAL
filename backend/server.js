import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import nosqlSanitize from "./middleware/security.js";
import rateLimiter from "./middleware/rateLimiter.js";

dotenv.config();

// Initialize custom rate limiters
const authRateLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // max 20 auth requests per 15 minutes per IP
    message: "Too many authentication requests from this IP. Please try again after 15 minutes."
});

const globalRateLimiter = rateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // max 100 API requests per minute per IP
    message: "Too many requests. Please try again in a minute."
});

const startServer = async () => {
    await connectDB();

    const app = express();

    app.set("trust proxy", 1);

    app.use(cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true
    }));

    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ limit: "10mb", extended: true }));
    
    // Apply NoSQL Sanitization and Global Rate Limiting
    app.use(nosqlSanitize);
    app.use(globalRateLimiter);

    app.use("/uploads", express.static("public/uploads"));

    app.get("/", (req, res) => {
        res.send("Server is running");
    });

    // Apply strict rate limiting to auth routes
    app.use("/api/auth", authRateLimiter, authRoutes);

    app.use("/api/jobs", jobRoutes);

    app.use("/api/applications", applicationRoutes);

    app.use("/api/dashboard", dashboardRoutes);

    // Centralized Global Error Handler Middleware
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(err.status || 500).json({
            message: err.message || "Internal Server Error"
        });
    });

    app.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`);
    });
};

startServer();