import { v2 as cloudinary } from "cloudinary";
import User from "../models/User.js";
import College from "../models/College.js";

cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
const fail = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });

export const uploadCollegeIdCard = async (dataUri, userId) => {
    if (typeof dataUri !== "string") throw fail("College ID card is required.");
    const match = dataUri.match(/^data:(image\/(?:jpeg|png)|application\/pdf);base64,([A-Za-z0-9+/=]+)$/);
    if (!match) throw fail("Upload a JPG, PNG, or PDF college ID card.");
    const mime = match[1];
    const buffer = Buffer.from(match[2], "base64");
    if (!buffer.length || buffer.length > 5 * 1024 * 1024) throw fail("College ID card must be no larger than 5 MB.");
    const validMagic = mime === "application/pdf" ? buffer.subarray(0, 5).toString() === "%PDF-"
        : mime === "image/jpeg" ? buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
        : buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
    if (!validMagic) throw fail("The uploaded file does not match its declared type.");
    const resourceType = mime === "application/pdf" ? "raw" : "image";
    const publicId = `student_${userId}_${Date.now()}`;
    const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: "college-id-cards", public_id: publicId, resource_type: resourceType, type: "authenticated", overwrite: false }, (err, value) => err ? reject(err) : resolve(value));
        stream.end(buffer);
    });
    return { publicId: result.public_id, resourceType, format: result.format || (resourceType === "raw" ? "pdf" : "jpg") };
};

// Query only this administrator's college and only students awaiting a decision.
export const getVerificationQueue = async (collegeId, queryParams = {}) => {
    const requestedPage = Number(queryParams.page);
    const requestedLimit = Number(queryParams.limit);
    const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const limit = Number.isSafeInteger(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 50) : 10;
    const search = String(queryParams.search || "").trim().slice(0, 100);
    const filter = {
        college: collegeId,
        role: "student",
        verificationStatus: { $in: ["pending", "rejected"] },
    };

    if (search) {
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const searchRegex = new RegExp(escaped, "i");
        filter.$or = [
            { name: searchRegex },
            { email: searchRegex },
            { branch: searchRegex },
            { contactNumber: searchRegex },
            ...( /^\d{4}$/.test(search) ? [{ graduationYear: Number(search) }] : []),
        ];
    }

    const totalStudents = await User.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(totalStudents / limit));
    const currentPage = Math.min(page, totalPages);
    const students = await User.find(filter)
        .select("name email cgpa branch graduationYear skills contactNumber verificationStatus verificationRejectionReason collegeIdCardPublicId collegeIdCardResourceType collegeIdCardFormat createdAt")
        .sort({ createdAt: 1, _id: 1 })
        .skip((currentPage - 1) * limit)
        .limit(limit)
        .lean();

    return { students, totalStudents, totalPages, currentPage, limit };
};

export const decideStudentVerification = async ({ studentId, collegeId, action, reason }) => {
    const student = await User.findOne({ _id: studentId, college: collegeId, role: "student" }).select("+collegeIdCardPublicId +collegeIdCardResourceType +collegeIdCardFormat");
    if (!student) throw fail("Student not found in your college.", 404);
    if (!student.collegeIdCardPublicId) throw fail("Student has not uploaded a college ID card.", 409);
    if (action === "approve") {
        student.verificationStatus = "verified";
        student.verifiedAt = new Date();
        student.verificationRejectionReason = "";
    } else if (action === "reject") {
        const cleanReason = String(reason || "").trim();
        if (!cleanReason) throw fail("Provide a rejection reason.");
        student.verificationStatus = "rejected";
        student.verifiedAt = null;
        student.verificationRejectionReason = cleanReason;
    } else throw fail("Invalid verification action.");
    await student.save();
    return { id: String(student._id), name: student.name, email: student.email, verificationStatus: student.verificationStatus, verificationRejectionReason: student.verificationRejectionReason };
};

export const getStudentIdCardUrl = async ({ studentId, collegeId }) => {
    const student = await User.findOne({ _id: studentId, college: collegeId, role: "student" }).select("+collegeIdCardPublicId +collegeIdCardResourceType +collegeIdCardFormat");
    if (!student?.collegeIdCardPublicId) throw fail("College ID card not found.", 404);
    const resourceType = student.collegeIdCardResourceType || "image";
    const url = cloudinary.utils.private_download_url(
        student.collegeIdCardPublicId,
        student.collegeIdCardFormat,
        { resource_type: resourceType, type: "authenticated", expires_at: Math.floor(Date.now() / 1000) + 300 }
    );
    return { url };
};

export const ensureApprovedCollege = async collegeId => {
    const college = await College.findById(collegeId).select("status").lean();
    if (!college || college.status !== "approved") throw fail("Your college is not approved and active.", 403);
    return college;
};

export const resubmitStudentIdCard = async (userId, dataUri) => {
    const student = await User.findOne({ _id: userId, role: "student" }).select("+collegeIdCardPublicId +collegeIdCardResourceType +collegeIdCardFormat");
    if (!student) throw fail("Student account not found.", 404);
    if (student.verificationStatus === "verified") throw fail("Your college affiliation is already verified. Contact your College Admin if this needs correction.", 409);
    const uploaded = await uploadCollegeIdCard(dataUri, String(userId));
    const old = { publicId: student.collegeIdCardPublicId, resourceType: student.collegeIdCardResourceType };
    student.collegeIdCardPublicId = uploaded.publicId;
    student.collegeIdCardResourceType = uploaded.resourceType;
    student.collegeIdCardFormat = uploaded.format;
    student.verificationStatus = "pending";
    student.verificationRejectionReason = "";
    student.verifiedAt = null;
    await student.save();
    if (old.publicId) {
        try { await cloudinary.uploader.destroy(old.publicId, { resource_type: old.resourceType || "image", type: "authenticated" }); }
        catch { /* replacement succeeded; stale-document cleanup is best effort */ }
    }
    return { verificationStatus: student.verificationStatus };
};
