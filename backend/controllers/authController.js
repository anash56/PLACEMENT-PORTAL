import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";
import { sendEmail } from "../services/emailService.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


export const register = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!password || password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long."
            });
        }

        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);

        if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
            return res.status(400).json({
                message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
            });
        }

        const existingUser =
            await User.findOne({ email });

        if (existingUser) {

            return res.status(400).json({

                message: "User already exists"

            });

        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const user =
            await User.create({

                name,

                email,

                password: hashedPassword

            });

        res.status(201).json({

            message: "User Registered Successfully",

            user

        });

    } catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};


export const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid Credentials"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

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

            role: user.role,

            name: user.name,

            email: user.email

        });

    }
    catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


export const getMe = async (req, res) => {

    try {

        const user = await User.findById(req.user.id)
            .select("-password");

        res.status(200).json(user);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

export const updateProfile = async (req, res) => {
    try {
        const { name, cgpa, branch, graduationYear, skills, contactNumber, resumeBase64, resumeName } = req.body;

        // Fetch current user from DB to evaluate final state and perform Cloudinary cleanup
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (cgpa !== undefined) updateData.cgpa = cgpa;
        if (branch !== undefined) updateData.branch = branch;
        if (graduationYear !== undefined) updateData.graduationYear = graduationYear;
        if (skills !== undefined) updateData.skills = skills;
        if (contactNumber !== undefined) updateData.contactNumber = contactNumber;

        // Process PDF resume if uploaded via base64
        if (resumeBase64 && resumeName) {
            if (!resumeBase64.startsWith("data:application/pdf;base64,")) {
                return res.status(400).json({
                    message: "Only PDF resumes are supported."
                });
            }

            // Cleanup old Cloudinary file if it exists
            if (currentUser.resumeUrl) {
                try {
                    const regex = /\/upload\/(?:v\d+\/)?([^\.]+)/;
                    const match = currentUser.resumeUrl.match(regex);
                    const oldPublicId = match ? match[1] : null;

                    if (oldPublicId) {
                        await cloudinary.uploader.destroy(oldPublicId);
                        console.log("Deleted old Cloudinary resume:", oldPublicId);
                    }
                } catch (deleteError) {
                    console.error("Failed to delete old Cloudinary resume:", deleteError);
                }
            }

            const base64Data = resumeBase64.replace(/^data:application\/pdf;base64,/, "");
            const buffer = Buffer.from(base64Data, "base64");

            const sanitizedName = resumeName.replace(/[^a-zA-Z0-9.-]/g, "_");
            const fileKey = `${req.user.id}_${Date.now()}_${sanitizedName}`;
            const publicId = fileKey.replace(/\.[^/.]+$/, ""); // Strip extension for Cloudinary auto upload

            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "resumes",
                        resource_type: "auto", // Let Cloudinary auto-detect
                        public_id: publicId
                    },
                    (error, uploadResult) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(uploadResult);
                        }
                    }
                );
                stream.end(buffer);
            });

            updateData.resumeUrl = result.secure_url;
        }

        const finalCgpa = cgpa !== undefined ? cgpa : currentUser.cgpa;
        const finalBranch = branch !== undefined ? branch : currentUser.branch;
        const finalGraduationYear = graduationYear !== undefined ? graduationYear : currentUser.graduationYear;
        const finalContactNumber = contactNumber !== undefined ? contactNumber : currentUser.contactNumber;

        updateData.isProfileCompleted = !!(finalCgpa && finalBranch && finalGraduationYear && finalContactNumber);

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, runValidators: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message: "Profile Updated Successfully",
            user
        });
    } catch (error) {
        res.status(500).json({
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
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Please provide an email address." });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "No user found with that email address." });
        }

        // Generate unhashed random token
        const resetToken = crypto.randomBytes(20).toString("hex");

        // Hash token and save to user document (expires in 10 minutes)
        user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
        await user.save();

        // Construct reset URL for frontend
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        const htmlMessage = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #2563eb;">Placement Portal - Password Reset</h2>
                <p>Hello ${user.name || "User"},</p>
                <p>You requested a password reset for your Placement Portal account. Please click the button below to reset your password. This link is valid for <strong>10 minutes</strong>.</p>
                <div style="margin: 25px 0;">
                    <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset My Password</a>
                </div>
                <p style="font-size: 12px; color: #6b7280;">If the button does not work, copy and paste this link into your browser:</p>
                <p style="font-size: 12px; color: #2563eb; word-break: break-all;">${resetUrl}</p>
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
                <p style="font-size: 12px; color: #9ca3af;">If you did not request a password reset, please ignore this email.</p>
            </div>
        `;

        await sendEmail({
            to: user.email,
            subject: "Password Reset Request - Placement Portal",
            html: htmlMessage
        });

        res.status(200).json({
            message: "Password reset link sent to your email!"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password || password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters long." });
        }

        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);

        if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
            return res.status(400).json({
                message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
            });
        }

        // Hash the URL token parameter to match stored database hash
        const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired password reset token." });
        }

        // Hash the new password and save
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;

        // Clear reset fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successfully! You can now log in with your new password." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
