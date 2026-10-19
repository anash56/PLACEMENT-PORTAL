import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema({
    college: { type: mongoose.Schema.Types.ObjectId, ref: "College", required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    tokenHash: { type: String, required: true, unique: true, select: false },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

invitationSchema.index({ college: 1, email: 1, usedAt: 1 });

export default mongoose.models.Invitation || mongoose.model("Invitation", invitationSchema);
