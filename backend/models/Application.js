import mongoose from "mongoose";

// Workflow stages are job-specific, so custom stage names cannot be constrained by a fixed enum.
export const FINAL_APPLICATION_STATUSES = ["Selected", "Rejected", "Withdrawn"];
export const LEGACY_APPLICATION_STATUSES = [
    "Pending",
    "Test Scheduled",
    "Interview Scheduled",
    "Shortlisted",
    "Offered",
];

const statusHistorySchema = new mongoose.Schema({
    status: { type: String, trim: true, required: true, maxlength: 80 },
    note: { type: String, trim: true, maxlength: 500, default: "" },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    changedAt: { type: Date, default: Date.now },
}, { _id: false });

const legacyStageHistorySchema = new mongoose.Schema({
    stage: { type: String, trim: true, required: true, maxlength: 80 },
    note: { type: String, trim: true, maxlength: 500, default: "" },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    changedAt: { type: Date, default: Date.now },
}, { _id: false });

const applicationSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    job: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },

    // The only active workflow value. It is either a stage in workflowStages or a final outcome.
    status: { type: String, trim: true, required: true, default: "Submitted", maxlength: 80 },
    // Snapshot of the job's workflow at application time; later job edits don't silently change it.
    workflowStages: { type: [{ type: String, trim: true, maxlength: 80 }], default: [] },
    statusHistory: { type: [statusHistorySchema], default: [] },

    // Legacy-only read compatibility. New code neither writes nor displays a separate stage track.
    currentStage: { type: String, trim: true, default: "", maxlength: 80, select: false },
    stageHistory: { type: [legacyStageHistorySchema], default: [], select: false },
}, { timestamps: true });

applicationSchema.index({ student: 1, job: 1 }, { unique: true });
applicationSchema.index({ job: 1 });
applicationSchema.index({ student: 1, status: 1, createdAt: -1 });

export default mongoose.models.Application || mongoose.model("Application", applicationSchema);
