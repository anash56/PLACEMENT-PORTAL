import crypto from "crypto";
import * as authService from "../services/authService.js";
import { cookieValue } from "../middleware/authMiddleware.js";

const isProduction = () => process.env.NODE_ENV === "production";
const cookieOptions = () => ({ httpOnly: true, secure: isProduction(), sameSite: isProduction() ? "none" : "lax", path: "/", maxAge: 7 * 24 * 60 * 60 * 1000 });
// The SPA receives the CSRF value in the response and keeps it in memory; both cookies remain HTTP-only.
const csrfOptions = () => ({ httpOnly: true, secure: isProduction(), sameSite: isProduction() ? "none" : "lax", path: "/", maxAge: 7 * 24 * 60 * 60 * 1000 });

export const register = async (req, res) => {
    try {
        const result = await authService.registerUser(req.body);
        return res.status(201).json({ message: "Registration submitted. Your college affiliation is pending verification.", user: result.user });
    } catch (error) { return res.status(error.statusCode || 500).json({ message: error.message }); }
};

export const login = async (req, res) => {
    try {
        const result = await authService.loginUser(req.body);
        const csrfToken = crypto.randomBytes(32).toString("hex");
        res.cookie("token", result.token, { ...cookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.cookie("csrf_token", csrfToken, csrfOptions());
        return res.status(200).json({ message: "Login successful.", user: result.user, csrfToken });
    } catch (error) { return res.status(error.statusCode || 500).json({ message: error.message }); }
};

export const getMe = async (req, res) => {
    try { return res.status(200).json({ ...(await authService.getUserById(req.user.id)), csrfToken: cookieValue(req, "csrf_token") }); }
    catch (error) { return res.status(error.statusCode || 500).json({ message: error.message }); }
};

export const updateProfile = async (req, res) => {
    try { return res.status(200).json({ message: "Profile updated successfully.", user: await authService.updateUserProfile(req.user.id, req.body) }); }
    catch (error) { return res.status(error.statusCode || 500).json({ message: error.message }); }
};

export const logout = (req, res) => {
    res.clearCookie("token", { httpOnly: true, secure: isProduction(), sameSite: isProduction() ? "none" : "lax", path: "/" });
    res.clearCookie("csrf_token", { httpOnly: false, secure: isProduction(), sameSite: isProduction() ? "none" : "lax", path: "/" });
    return res.status(200).json({ message: "Logged out successfully." });
};

export const forgotPassword = async (req, res) => {
    try {
        await authService.forgotPassword(req.body.email);
        return res.status(200).json({ message: "If an account exists for that email, a password reset link will be sent." });
    } catch (error) { return res.status(error.statusCode || 500).json({ message: error.message }); }
};

export const resetPassword = async (req, res) => {
    try { await authService.resetPassword(req.params.token, req.body.password); return res.status(200).json({ message: "Password reset successfully. You can now log in." }); }
    catch (error) { return res.status(error.statusCode || 500).json({ message: error.message }); }
};
