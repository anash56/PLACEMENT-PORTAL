import express from "express";

import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

import {
    getApplicantsByJob,
    updateApplicationStatus
}
from "../controllers/applicationController.js";


import {
    applyJob,
    getMyApplications
}
from "../controllers/applicationController.js";

const router = express.Router();

router.post(
    "/:jobId",
    protect,
    applyJob
);

router.get(
    "/my",
    protect,
    getMyApplications
);

router.get(
    "/job/:jobId",
    protect,
    adminOnly,
    getApplicantsByJob
);

router.patch(
    "/:id",
    protect,
    adminOnly,
    updateApplicationStatus
);


export default router;