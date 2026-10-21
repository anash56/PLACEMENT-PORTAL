import mongoose from "mongoose";

export const APPLICATION_STATUSES = [
    "Submitted",
    "Under Review",
    "Shortlisted",
    "Offered",
    "Rejected",
    "Withdrawn",
];

// Keep legacy values readable so existing applications remain valid without a migration.
export const LEGACY_APPLICATION_STATUSES = ["Pending", "Test Scheduled", "Interview Scheduled"];
export const ALL_APPLICATION_STATUSES = [...APPLICATION_STATUSES, ...LEGACY_APPLICATION_STATUSES];

const statusHistorySchema = new mongoose.Schema({
    status: { type: String, enum: ALL_APPLICATION_STATUSES, required: true },
    note: { type: String, trim: true, maxlength: 500, default: "" },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    changedAt: { type: Date, default: Date.now },
}, { _id: false });

const stageHistorySchema = new mongoose.Schema({
    stage: { type: String, trim: true, required: true, maxlength: 80 },
    note: { type: String, trim: true, maxlength: 500, default: "" },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    changedAt: { type: Date, default: Date.now },
}, { _id: false });

const applicationSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    status: { type: String, enum: ALL_APPLICATION_STATUSES, default: "Submitted" },
    statusHistory: { type: [statusHistorySchema], default: [] },
    // A stage is set only when the job owner configures selectionStages on that job.
    currentStage: { type: String, trim: true, default: "", maxlength: 80 },
    stageHistory: { type: [stageHistorySchema], default: [] },
}, { timestamps: true });

applicationSchema.index({ student: 1, job: 1 }, { unique: true });
applicationSchema.index({ job: 1 });
applicationSchema.index({ student: 1, status: 1, createdAt: -1 });

export default mongoose.models.Application || mongoose.model("Application", applicationSchema);
