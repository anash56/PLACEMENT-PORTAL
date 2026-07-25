import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

// Middlewares
import nosqlSanitize from "./middleware/security.js";
import { globalRateLimiter, authRateLimiter } from "./middleware/rateLimiter.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

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

    // Root Healthcheck Route
    app.get("/", (req, res) => {
        res.send("Placement Portal API is running");
    });

    // API Routes
    app.use("/api/auth", authRateLimiter, authRoutes);
    app.use("/api/jobs", jobRoutes);
    app.use("/api/applications", applicationRoutes);
    app.use("/api/dashboard", dashboardRoutes);

    // 404 & Centralized Global Error Handlers
    app.use(notFoundHandler);
    app.use(errorHandler);

    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
        console.error("Unhandled Rejection:", err);
    });
};

startServer();