import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();

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

    app.use("/uploads", express.static("public/uploads"));

    app.get("/", (req, res) => {
        res.send("Server is running");
    });

    app.use("/api/auth", authRoutes);

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