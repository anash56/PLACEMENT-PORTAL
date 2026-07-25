import * as authService from "../services/authService.js";

export const register = async (req, res) => {
    try {
        const user = await authService.registerUser(req.body);
        res.status(201).json({
            message: "User Registered Successfully",
            user
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message
        });
    }
};

export const login = async (req, res) => {
    try {
        const { token, role, name, email } = await authService.loginUser(req.body);

        const isProduction = process.env.NODE_ENV === "production";
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Login Successful",
            token,
            role,
            name,
            email
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message
        });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await authService.getUserById(req.user.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const user = await authService.updateUserProfile(req.user.id, req.body);
        res.status(200).json({
            message: "Profile Updated Successfully",
            user
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message
        });
    }
};

export const logout = async (req, res) => {
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax"
    });
    res.status(200).json({ message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
    try {
        await authService.forgotPassword(req.body.email);
        res.status(200).json({
            message: "Password reset link sent to your email!"
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        await authService.resetPassword(req.params.token, req.body.password);
        res.status(200).json({
            message: "Password reset successfully! You can now log in with your new password."
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message
        });
    }
};
