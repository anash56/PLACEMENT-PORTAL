import express from "express";

import protect from
"../middleware/authMiddleware.js";

import adminOnly from
"../middleware/adminMiddleware.js";

import {
   getDashboardStats
}
from "../controllers/dashboardController.js";

const router = express.Router();

router.get(
   "/stats",
   protect,
   adminOnly,
   getDashboardStats
);

export default router;