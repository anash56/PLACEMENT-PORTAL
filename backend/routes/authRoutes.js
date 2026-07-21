import express from 'express';
import { register, login, logout, getMe, updateProfile, forgotPassword, resetPassword } from '../controllers/authController.js';
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";
import { validateProfileUpdate } from "../middleware/validation.js";


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.get("/profile", protect, (req, res) => {
    res.json({
        message: "Protected Route Accessed",
        user: req.user
    });
});

router.put("/profile", protect, validateProfileUpdate, updateProfile);

router.get(
    "/admin",
    protect,
    adminOnly,
    (req, res) => {

        res.json({
            message: "Welcome Admin"
        });

    }
);

router.get(
    "/me",
    protect,
    getMe
);

router.post(
    "/logout",
    logout
);

export default router;