import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 160 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    password: { type: String, required: true, select: false },
    // `admin` remains in the enum solely so old test records can be read safely. Authorization middleware never grants it access.
    role: { type: String, enum: ["student", "college_admin", "super_admin", "admin"], default: "student", index: true },
    college: { type: mongoose.Schema.Types.ObjectId, ref: "College", default: null, index: true },
    verificationStatus: { type: String, enum: ["pending", "verified", "rejected"], default: "pending", index: true },
    collegeIdCardPublicId: { type: String, select: false },
    collegeIdCardResourceType: { type: String, enum: ["image", "raw"], select: false },
    collegeIdCardFormat: { type: String, select: false },
    verificationRejectionReason: { type: String, default: "", maxlength: 1000 },
    verifiedAt: { type: Date, default: null },
    isSuspended: { type: Boolean, default: false, index: true },
    cgpa: { type: Number, min: 0, max: 10 },
    branch: { type: String, trim: true },
    graduationYear: { type: Number, min: 1900, max: 2100 },
    skills: { type: [String], default: [] },
    contactNumber: { type: String, trim: true },
    resumeUrl: { type: String },
    isProfileCompleted: { type: Boolean, default: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false }
}, { timestamps: true });

userSchema.index({ college: 1, role: 1, verificationStatus: 1 });

export default mongoose.models.User || mongoose.model("User", userSchema);
