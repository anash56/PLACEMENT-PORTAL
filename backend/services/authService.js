import User from "../models/User.js";
import College from "../models/College.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";
import { sendEmail } from "./emailService.js";
import { uploadCollegeIdCard } from "./idCardService.js";

cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
const fail = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });
const validatePassword = password => {
    if (!password || password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
        throw fail("Password must be at least 8 characters and contain uppercase, lowercase, a number, and a special character.");
    }
};
const publicUser = user => ({
    id: String(user._id), _id: String(user._id), name: user.name, email: user.email, role: user.role,
    college: user.college?._id ? String(user.college._id) : user.college ? String(user.college) : null,
    collegeName: user.college?.name || null, collegeStatus: user.college?.status || null,
    verificationStatus: user.verificationStatus, verificationRejectionReason: user.verificationRejectionReason || "",
    cgpa: user.cgpa, branch: user.branch, graduationYear: user.graduationYear, skills: user.skills || [],
    contactNumber: user.contactNumber, resumeUrl: user.resumeUrl, isProfileCompleted: Boolean(user.isProfileCompleted), isSuspended: Boolean(user.isSuspended)
});

export const registerUser = async ({ name, email, password, collegeId, collegeIdCardBase64 }) => {
    validatePassword(password);
    if (!name || String(name).trim().length < 2 || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) throw fail("Provide a valid name and email address.");
    if (!collegeId) throw fail("Select your college before registering.");
    const college = await College.findOne({ _id: collegeId, status: "approved" }).lean();
    if (!college) throw fail("Select a currently approved college.", 400);
    const normalizedEmail = String(email).trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail }).lean()) throw fail("User already exists.", 409);
    if (!collegeIdCardBase64) throw fail("Upload your college ID card to register.");
    // Upload first so no database user is created when the document is invalid/unavailable.
    const idCard = await uploadCollegeIdCard(collegeIdCardBase64, `new_${crypto.randomBytes(10).toString("hex")}`);
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = await User.create({ name: String(name).trim(), email: normalizedEmail, password: hashedPassword, role: "student", college: college._id, verificationStatus: "pending", ...{ collegeIdCardPublicId: idCard.publicId, collegeIdCardResourceType: idCard.resourceType, collegeIdCardFormat: idCard.format } });
        return { user: publicUser(user) };
    } catch (error) {
        try { await cloudinary.uploader.destroy(idCard.publicId, { resource_type: idCard.resourceType, type: "authenticated" }); } catch { /* orphan cleanup is best effort */ }
        if (error.code === 11000) throw fail("An account with this email already exists.", 409);
        throw error;
    }
};

export const loginUser = async ({ email, password }) => {
    const user = await User.findOne({ email: String(email || "").trim().toLowerCase() }).select("+password");
    if (!user || !(await bcrypt.compare(password || "", user.password))) throw fail("Invalid email or password.", 401);
    if (user.isSuspended) throw fail("This account has been suspended.", 403);
    if (user.role === "admin") throw fail("Legacy admin access has been disabled. Provision a new administrator account.", 403);
    if (user.role === "college_admin" || user.role === "student") {
        const college = user.college ? await College.findById(user.college).lean() : null;
        if (!college) throw fail("Your account is not associated with a valid college.", 403);
        if (college.status === "suspended" || college.status === "rejected") throw fail("Your college is currently not permitted to use the portal.", 403);
        if (user.role === "college_admin" && college.status !== "approved") throw fail("Your college has not been approved.", 403);
    }
    const token = jwt.sign({ id: String(user._id) }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return { token, user: publicUser(user) };
};

export const getUserById = async userId => {
    const user = await User.findById(userId).populate("college", "name status").lean();
    if (!user) throw fail("User not found.", 404);
    return publicUser(user);
};

export const updateUserProfile = async (userId, bodyData) => {
    const { name, cgpa, branch, graduationYear, skills, contactNumber, resumeBase64, resumeName } = bodyData;
    const currentUser = await User.findById(userId);
    if (!currentUser) throw fail("User not found.", 404);
    const updateData = {};
    if (name !== undefined) updateData.name = String(name).trim();
    if (cgpa !== undefined) updateData.cgpa = cgpa === "" || cgpa === null ? undefined : Number(cgpa);
    if (branch !== undefined) updateData.branch = String(branch).trim();
    if (graduationYear !== undefined) updateData.graduationYear = graduationYear === "" || graduationYear === null ? undefined : Number(graduationYear);
    if (skills !== undefined) updateData.skills = skills;
    if (contactNumber !== undefined) updateData.contactNumber = String(contactNumber).trim();

    if (resumeBase64 && resumeName) {
        const match = /^data:application\/pdf;base64,([A-Za-z0-9+/=]+)$/.exec(resumeBase64);
        if (!match) throw fail("Only PDF resumes are supported.");
        const buffer = Buffer.from(match[1], "base64");
        if (!buffer.length || buffer.length > 5 * 1024 * 1024) throw fail("Resume must be no larger than 5 MB.");
        if (buffer.subarray(0, 5).toString() !== "%PDF-") throw fail("The uploaded resume is not a valid PDF.");
        const publicId = `user_${userId}_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
        const uploaded = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ folder: "resumes", resource_type: "raw", public_id: publicId, overwrite: false }, (error, result) => error ? reject(error) : resolve(result));
            stream.end(buffer);
        });
        updateData.resumeUrl = uploaded.secure_url;
        if (currentUser.resumeUrl) {
            try {
                const matchOld = currentUser.resumeUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^/.]+)?$/);
                if (matchOld) await cloudinary.uploader.destroy(matchOld[1], { resource_type: "raw" });
            } catch { /* preserve successful profile update even if old file cleanup fails */ }
        }
    }
    const finalCgpa = updateData.cgpa !== undefined ? updateData.cgpa : currentUser.cgpa;
    const finalBranch = updateData.branch !== undefined ? updateData.branch : currentUser.branch;
    const finalGraduationYear = updateData.graduationYear !== undefined ? updateData.graduationYear : currentUser.graduationYear;
    const finalContact = updateData.contactNumber !== undefined ? updateData.contactNumber : currentUser.contactNumber;
    updateData.isProfileCompleted = Boolean(finalCgpa && finalBranch && finalGraduationYear && finalContact);
    const user = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).populate("college", "name status").lean();
    if (!user) throw fail("User not found.", 404);
    return publicUser(user);
};

export const forgotPassword = async email => {
    if (!email) throw fail("Please provide an email address.");
    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    // Avoid account enumeration: the controller can return the same message for existing/missing accounts.
    if (!user) return;
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    const url = `${(process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "")}/reset-password/${resetToken}`;
    await sendEmail({ to: user.email, subject: "Password Reset Request - Placement Portal", html: `<p>Hello ${String(user.name).replace(/[&<>"']/g, "")}.</p><p><a href="${url}">Reset your password</a>. This link expires in 10 minutes.</p>` });
};

export const resetPassword = async (token, password) => {
    validatePassword(password);
    const hashedToken = crypto.createHash("sha256").update(String(token || "")).digest("hex");
    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: new Date() } }).select("+resetPasswordToken +resetPasswordExpire");
    if (!user) throw fail("Invalid or expired password reset token.");
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
};
