import express from "express";

import {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob
} from "../controllers/jobController.js";

import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post(
    "/",
    protect,
    adminOnly,
    createJob
);

router.get(
    "/",
    getJobs
);

router.get("/:id", getJobById);

router.patch(
    "/:id",
    protect,
    adminOnly,
    updateJob
);

router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteJob
);

export default router;