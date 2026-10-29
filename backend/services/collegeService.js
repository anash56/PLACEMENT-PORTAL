import crypto from "crypto";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import College from "../models/College.js";
import User from "../models/User.js";
import Invitation from "../models/Invitation.js";
import { sendEmail, isEmailConfigured } from "./emailService.js";

cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
const fail = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const submitCollegeRequest = async payload => {
    const name = String(payload.name || "").trim().replace(/\s+/g, " ");
    const contactPerson = String(payload.contactPerson || "").trim();
    const contactEmail = String(payload.contactEmail || "").trim().toLowerCase();
    const contactPhone = String(payload.contactPhone || "").trim();
    const address = String(payload.address || "").trim();
    const website = String(payload.website || "").trim();
    const contactDesignation = String(payload.contactDesignation || "").trim();
    if (name.length < 3 || !contactPerson || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail) || !contactPhone || !address) throw fail("Provide a valid college name, contact person, contact email, phone, and address.");
    if (website && !/^https?:\/\//i.test(website)) throw fail("Website must start with http:// or https://.");
    const nameNormalized = name.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("en");
    const existing = await College.findOne({ $or: [{ nameNormalized }, { status: { $in: ["pending", "approved", "suspended"] }, contactEmail }] }).lean();
    if (existing) throw fail("A college request with this name or contact email already exists.", 409);
    try {
        return await College.create({ name, nameNormalized, contactPerson, contactEmail, contactPhone, address, website, contactDesignation, status: "pending" });
    } catch (error) {
        if (error.code === 11000) throw fail("A request for this college already exists.", 409);
        throw error;
    }
};

export const searchApprovedColleges = async (q = "") => {
    const query = String(q).trim().slice(0, 100);
    if (query.length < 2) return [];
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return College.find({ status: "approved", name: { $regex: escaped, $options: "i" } })
        .select("name") .sort({ name: 1 }).limit(15).lean();
};

export const listColleges = async ({ status, search = "", page = 1, limit = 10 } = {}) => {
    const allowed = ["pending", "approved", "rejected", "suspended"];
    const filter = allowed.includes(status) ? { status } : {};
    const query = String(search || "").trim().slice(0, 100);
    if (query) {
        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.$or = [
            { name: { $regex: escaped, $options: "i" } },
            { contactPerson: { $regex: escaped, $options: "i" } },
            { contactDesignation: { $regex: escaped, $options: "i" } },
            { contactEmail: { $regex: escaped, $options: "i" } },
            { contactPhone: { $regex: escaped, $options: "i" } },
            { address: { $regex: escaped, $options: "i" } },
            { website: { $regex: escaped, $options: "i" } },
        ];
    }

    const requestedPage = Number(page);
    const requestedLimit = Number(limit);
    const safeLimit = Number.isSafeInteger(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 50) : 10;
    const safePage = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const [totalColleges, statusCounts] = await Promise.all([
        College.countDocuments(filter),
        College.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    ]);
    const totalPages = Math.max(1, Math.ceil(totalColleges / safeLimit));
    const currentPage = Math.min(safePage, totalPages);
    const colleges = await College.find(filter)
        .select("name contactPerson contactDesignation contactEmail contactPhone website address status rejectionReason reviewReason approvedAt suspendedAt admin createdAt updatedAt")
        .populate("admin", "name email")
        .sort({ createdAt: -1, _id: -1 })
        .skip((currentPage - 1) * safeLimit)
        .limit(safeLimit)
        .lean();

    const counts = { all: 0, pending: 0, approved: 0, rejected: 0, suspended: 0 };
    for (const item of statusCounts) {
        if (Object.prototype.hasOwnProperty.call(counts, item._id)) counts[item._id] = item.count;
        counts.all += item.count;
    }

    return { colleges, totalColleges, currentPage, totalPages, counts };
};

const createInvitation = async (college, creatorId) => {
    if (college.status !== "approved") throw fail("Only an approved college can receive an administrator invitation.", 409);
    if (college.admin) {
        const activeAdmin = await User.findOne({ _id: college.admin, role: "college_admin", isSuspended: false }).lean();
        if (activeAdmin) throw fail("This college already has an active College Admin.", 409);

        // Repair an obsolete assignment only if it has not changed concurrently.
        const staleAdminId = college.admin;
        const clearedCollege = await College.findOneAndUpdate(
            { _id: college._id, status: "approved", admin: staleAdminId },
            { $set: { admin: null } },
            { new: true }
        );
        if (!clearedCollege) throw fail("The college administrator assignment changed. Refresh and try again.", 409);
        college.admin = null;
    }

    const existingAccount = await User.findOne({ email: college.contactEmail }).select("_id role").lean();
    if (existingAccount) {
        throw fail("The college contact email already belongs to an account. Use a separate official email for the College Admin account.", 409);
    }

    const rawToken = crypto.randomBytes(32).toString("base64url");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const invitation = await Invitation.create({ college: college._id, email: college.contactEmail, tokenHash, expiresAt, createdBy: creatorId });
    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
    const setupUrl = `${frontendUrl}/accept-invitation?token=${encodeURIComponent(rawToken)}`;

    let emailResult;
    try {
        emailResult = await sendEmail({
            to: college.contactEmail,
            subject: `College Admin invitation - ${college.name}`,
            html: `<p>You have been invited to administer <strong>${esc(college.name)}</strong> on Placement Portal.</p><p><a href="${esc(setupUrl)}">Set up your College Admin account</a></p><p>This link expires in 24 hours and can only be used once.</p>`
        });
    } catch (error) {
        // Do not invalidate previously delivered links if this delivery attempt fails.
        await Invitation.updateOne({ _id: invitation._id, usedAt: null }, { $set: { usedAt: new Date() } }).catch(() => {});
        throw Object.assign(fail("The invitation email could not be delivered. Check the email configuration and try again.", 502), { invitationCreated: false });
    }

    // Only retire previous links after the replacement link has been delivered or surfaced locally in development.
    await Invitation.updateMany(
        { college: college._id, _id: { $ne: invitation._id }, usedAt: null },
        { $set: { usedAt: new Date() } }
    );

    return {
        email: college.contactEmail,
        expiresAt,
        ...(emailResult.sent
            ? { delivered: true }
            : { delivered: false, ...(process.env.NODE_ENV !== "production" ? { developmentSetupUrl: setupUrl } : {}) })
    };
};


export const reviewCollege = async (collegeId, action, reason, actorId) => {
    if (!mongoose.isValidObjectId(collegeId)) throw fail("Invalid college ID.");
    const college = await College.findById(collegeId);
    if (!college) throw fail("College not found.", 404);
    if (action === "approve") {
        if (college.status === "suspended") throw fail("Restore a suspended college before approving it.", 409);
        college.status = "approved";
        college.approvedAt = college.approvedAt || new Date();
        college.rejectionReason = "";
        college.reviewReason = String(reason || "").trim();
        await college.save();
        let invitation = null;
        const activeAdmin = college.admin ? await User.findOne({ _id: college.admin, role: "college_admin", isSuspended: false }).lean() : null;
        if (!activeAdmin) invitation = await createInvitation(college, actorId);
        return { college: college.toObject(), invitation };
    }
    if (action === "reject") {
        const cleanReason = String(reason || "").trim();
        if (!cleanReason) throw fail("Provide a rejection reason.");
        college.status = "rejected";
        college.rejectionReason = cleanReason;
        college.reviewReason = cleanReason;
        await college.save();
        await Invitation.updateMany({ college: college._id, usedAt: null }, { $set: { usedAt: new Date() } });
        return { college: college.toObject(), invitation: null };
    }
    if (action === "suspend") {
        college.status = "suspended";
        college.suspendedAt = new Date();
        college.reviewReason = String(reason || "").trim();
        await college.save();
        return { college: college.toObject(), invitation: null };
    }
    if (action === "restore") {
        if (!college.approvedAt) throw fail("A college must be approved before it can be restored.", 409);
        college.status = "approved";
        college.suspendedAt = null;
        college.reviewReason = String(reason || "").trim();
        await college.save();
        return { college: college.toObject(), invitation: null };
    }
    throw fail("Unsupported college action.");
};

export const inviteCollegeAdmin = async (collegeId, actorId) => {
    if (!mongoose.isValidObjectId(collegeId)) throw fail("Invalid college ID.");
    const college = await College.findById(collegeId);
    if (!college) throw fail("College not found.", 404);
    return createInvitation(college, actorId);
};

export const acceptInvitation = async ({ token, name, password } = {}) => {
    const cleanToken = typeof token === "string" ? token.trim() : "";
    const cleanName = typeof name === "string" ? name.trim() : "";
    if (cleanToken.length < 30) throw fail("Invalid or expired invitation.", 400);
    if (cleanName.length < 2) throw fail("Enter your full name.");
    if (typeof password !== "string" || password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
        throw fail("Password must be at least 8 characters and contain uppercase, lowercase, number, and special character.");
    }

    const tokenHash = crypto.createHash("sha256").update(cleanToken).digest("hex");
    const invitation = await Invitation.findOne({
        tokenHash,
        usedAt: null,
        expiresAt: { $gt: new Date() }
    }).select("+tokenHash");
    if (!invitation) throw fail("This invitation is invalid, expired, or already used.", 400);

    // Run checks that can fail normally BEFORE consuming the one-time token.
    const college = await College.findById(invitation.college);
    if (!college || college.status !== "approved") throw fail("This college is not currently approved.", 409);
    if (await User.exists({ email: invitation.email })) {
        throw fail("This email already belongs to an account. College Admin accounts need a separate email; existing accounts are not automatically promoted.", 409);
    }

    let staleAdminId = null;
    if (college.admin) {
        const currentAdmin = await User.findOne({
            _id: college.admin,
            role: "college_admin",
            isSuspended: false
        }).lean();
        if (currentAdmin) throw fail("This college already has an administrator assigned.", 409);
        staleAdminId = college.admin;
    }

    // Atomically claim the invitation so concurrent submissions cannot create duplicate accounts.
    const claimedAt = new Date();
    const claimed = await Invitation.findOneAndUpdate(
        { _id: invitation._id, usedAt: null, expiresAt: { $gt: claimedAt } },
        { $set: { usedAt: claimedAt } },
        { new: true }
    ).select("+tokenHash");
    if (!claimed) throw fail("This invitation has already been used or has expired.", 409);

    const bcrypt = (await import("bcryptjs")).default;
    let createdUser = null;
    try {
        if (staleAdminId) {
            const clearedCollege = await College.findOneAndUpdate(
                { _id: college._id, status: "approved", admin: staleAdminId },
                { $set: { admin: null } },
                { new: true }
            );
            if (!clearedCollege) throw fail("The college administrator assignment changed. Request a fresh invitation if needed.", 409);
        }

        createdUser = await User.create({
            name: cleanName,
            email: claimed.email,
            password: await bcrypt.hash(password, 10),
            role: "college_admin",
            college: college._id,
            verificationStatus: "verified"
        });

        const assignedCollege = await College.findOneAndUpdate(
            { _id: college._id, status: "approved", admin: null },
            { $set: { admin: createdUser._id } },
            { new: true }
        );
        if (!assignedCollege) throw fail("A College Admin was assigned concurrently. Request a fresh invitation if needed.", 409);

        return {
            id: String(createdUser._id),
            name: createdUser.name,
            email: createdUser.email,
            role: createdUser.role,
            college: String(college._id),
            collegeName: college.name
        };
    } catch (error) {
        // Roll back partial account creation. Only restore the token if the college is still eligible.
        if (createdUser) await User.deleteOne({ _id: createdUser._id }).catch(() => {});
        try {
            const [freshCollege, emailOccupied] = await Promise.all([
                College.findById(college._id).select("status admin").lean(),
                User.exists({ email: claimed.email })
            ]);
            if (freshCollege?.status === "approved" && !freshCollege.admin && !emailOccupied) {
                await Invitation.updateOne(
                    { _id: claimed._id, usedAt: claimedAt },
                    { $set: { usedAt: null } }
                );
            }
        } catch {
            // Preserve the original failure; rollback is best-effort if the database is unavailable.
        }
        throw error;
    }
};


export const invitationEmailConfigured = isEmailConfigured;
