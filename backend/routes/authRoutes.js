import express from "express";
import { register, login, logout, getMe, updateProfile, forgotPassword, resetPassword } from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";
import { csrfProtect, originCheck } from "../middleware/csrfMiddleware.js";
import { validateProfileUpdate } from "../middleware/validation.js";

const router = express.Router();
router.post("/register", originCheck, register);
router.post("/login", originCheck, login);
router.post("/forgot-password", originCheck, forgotPassword);
router.post("/reset-password/:token", originCheck, resetPassword);
router.get("/profile", protect, (req, res) => res.json({ message: "Protected Route Accessed", user: req.user }));
router.put("/profile", protect, csrfProtect, validateProfileUpdate, updateProfile);
router.get("/admin", protect, adminOnly, (req, res) => res.json({ message: "Welcome administrator" }));
router.get("/me", protect, getMe);
router.post("/logout", originCheck, csrfProtect, logout);
export default router;
