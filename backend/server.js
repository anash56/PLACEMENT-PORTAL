import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import collegeRoutes from "./routes/collegeRoutes.js";
import verificationRoutes from "./routes/verificationRoutes.js";
import nosqlSanitize from "./middleware/security.js";
import { globalRateLimiter, authRateLimiter } from "./middleware/rateLimiter.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const startServer = async () => {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error("JWT_SECRET must be configured with at least 32 characters.");
    await connectDB();
    const app = express();
    app.set("trust proxy", 1);
    const allowedOrigin = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
    app.use(cors({ origin: allowedOrigin, credentials: true, methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], allowedHeaders: ["Content-Type", "X-CSRF-Token"] }));
    app.use(express.json({ limit: "8mb" }));
    app.use(express.urlencoded({ limit: "8mb", extended: true }));
    app.use(nosqlSanitize);
    app.use(globalRateLimiter);
    app.get("/", (req, res) => res.send("Placement Portal API is running"));
    app.use("/api/auth", authRateLimiter, authRoutes);
    app.use("/api/colleges", collegeRoutes);
    app.use("/api/verification", verificationRoutes);
    app.use("/api/jobs", jobRoutes);
    app.use("/api/applications", applicationRoutes);
    app.use("/api/dashboard", dashboardRoutes);
    app.use(notFoundHandler);
    app.use(errorHandler);
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
};

startServer().catch(error => { console.error("Server startup failed:", error.message); process.exit(1); });
