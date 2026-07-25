import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";
import { sendEmail } from "./emailService.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const createCustomError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

export const registerUser = async ({ name, email, password }) => {
    if (!password || password.length < 8) {
        throw createCustomError("Password must be at least 8 characters long.", 400);
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
        throw createCustomError(
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
            400
        );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw createCustomError("User already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword
    });

    return user;
};

export const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw createCustomError("User not found", 404);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw createCustomError("Invalid Credentials", 401);
    }

    const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return {
        token,
        role: user.role,
        name: user.name,
        email: user.email
    };
};

export const getUserById = async (userId) => {
    const user = await User.findById(userId).select("-password");
    if (!user) {
        throw createCustomError("User not found", 404);
    }
    return user;
};

export const updateUserProfile = async (userId, bodyData) => {
    const { name, cgpa, branch, graduationYear, skills, contactNumber, resumeBase64, resumeName } = bodyData;

    const currentUser = await User.findById(userId);
    if (!currentUser) {
        throw createCustomError("User not found", 404);
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (cgpa !== undefined) updateData.cgpa = cgpa;
    if (branch !== undefined) updateData.branch = branch;
    if (graduationYear !== undefined) updateData.graduationYear = graduationYear;
    if (skills !== undefined) updateData.skills = skills;
    if (contactNumber !== undefined) updateData.contactNumber = contactNumber;

    if (resumeBase64 && resumeName) {
        if (!resumeBase64.startsWith("data:application/pdf;base64,")) {
            throw createCustomError("Only PDF resumes are supported.", 400);
        }

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
        const fileKey = `${userId}_${Date.now()}_${sanitizedName}`;
        const publicId = fileKey.replace(/\.[^/.]+$/, "");

        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "resumes",
                    resource_type: "auto",
                    public_id: publicId
                },
                (error, uploadResult) => {
                    if (error) reject(error);
                    else resolve(uploadResult);
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
        userId,
        updateData,
        { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
        throw createCustomError("User not found", 404);
    }

    return user;
};

export const forgotPassword = async (email) => {
    if (!email) {
        throw createCustomError("Please provide an email address.", 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw createCustomError("No user found with that email address.", 404);
    }

    const resetToken = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

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
};

export const resetPassword = async (token, password) => {
    if (!password || password.length < 8) {
        throw createCustomError("Password must be at least 8 characters long.", 400);
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
        throw createCustomError(
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
            400
        );
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        throw createCustomError("Invalid or expired password reset token.", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
};
