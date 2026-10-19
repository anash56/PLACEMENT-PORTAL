import express from "express";
import protect from "../middleware/authMiddleware.js";
import { superAdminOnly } from "../middleware/adminMiddleware.js";
import { csrfProtect, originCheck } from "../middleware/csrfMiddleware.js";
import * as collegeController from "../controllers/collegeController.js";
import * as inviteController from "../controllers/invitationController.js";

const router = express.Router();
router.post("/requests", originCheck, collegeController.submitRequest);
router.get("/search", collegeController.searchApproved);
router.post("/invitations/accept", originCheck, inviteController.accept);
router.get("/admin/list", protect, superAdminOnly, collegeController.list);
router.patch("/admin/:id/approve", protect, superAdminOnly, csrfProtect, collegeController.approve);
router.patch("/admin/:id/reject", protect, superAdminOnly, csrfProtect, collegeController.reject);
router.patch("/admin/:id/suspend", protect, superAdminOnly, csrfProtect, collegeController.suspend);
router.patch("/admin/:id/restore", protect, superAdminOnly, csrfProtect, collegeController.restore);
router.post("/admin/:id/invite", protect, superAdminOnly, csrfProtect, collegeController.invite);
export default router;
