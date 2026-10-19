import express from "express";
import protect from "../middleware/authMiddleware.js";
import { getDashboardStats } from "../controllers/dashboardController.js";
const router = express.Router();
router.get("/stats", protect, (req, res, next) => ["college_admin", "super_admin"].includes(req.user.role) ? next() : res.status(403).json({ message: "Administrator access required." }), getDashboardStats);
export default router;
