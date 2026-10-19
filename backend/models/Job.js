import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 200 },
    company: { type: String, required: true, trim: true, maxlength: 200 },
    location: { type: String, required: true, trim: true, maxlength: 200 },
    salary: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, maxlength: 20000 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    college: { type: mongoose.Schema.Types.ObjectId, ref: "College", required: true, index: true },
    minCgpa: { type: Number, default: 0, min: 0, max: 10 },
    allowedBranches: { type: [String], default: [] },
    deadline: { type: Date, default: null }
}, { timestamps: true });

jobSchema.index({ college: 1, createdAt: -1 });
jobSchema.index({ createdBy: 1 });
jobSchema.index({ salary: -1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ title: "text", company: "text", description: "text" });

export default mongoose.models.Job || mongoose.model("Job", jobSchema);
