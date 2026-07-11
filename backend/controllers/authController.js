import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

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

            const base64Data = resumeBase64.replace(/^data:application\/pdf;base64,/, "");
            const buffer = Buffer.from(base64Data, "base64");

            // Setup uploads directory inside public/
            const uploadDir = path.join(process.cwd(), "public", "uploads", "resumes");
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const sanitizedName = resumeName.replace(/[^a-zA-Z0-9.-]/g, "_");
            const fileName = `${req.user.id}_${Date.now()}_${sanitizedName}`;
            const filePath = path.join(uploadDir, fileName);

            // Write raw buffer to file on disk
            fs.writeFileSync(filePath, buffer);

            // Save public URL dynamically
            const serverUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
            updateData.resumeUrl = `${serverUrl}/uploads/resumes/${fileName}`;
        }

        // Auto mark profile as completed if all required fields are provided
        if (cgpa && branch && graduationYear && contactNumber) {
            updateData.isProfileCompleted = true;
        }

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
