import mongoose from "mongoose";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import College from "../models/College.js";
import { meetsJobEligibility } from "./eligibilityService.js";
const fail = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });
const statuses = ["Pending", "Test Scheduled", "Interview Scheduled", "Shortlisted", "Offered", "Rejected"];
export const applyJob = async (studentId, role, jobId) => {
    if (role !== "student") throw fail("Only students can apply for jobs.", 403);
    const user = await User.findById(studentId).lean();
    if (!user || user.isSuspended) throw fail("Account unavailable.", 403);
    if (!user.college || user.verificationStatus !== "verified") throw fail("Your college affiliation must be verified before applying.", 403);
    const college = await College.findById(user.college).select("status").lean();
    if (!college || college.status !== "approved") throw fail("Your college is not approved and active.", 403);
    if (!mongoose.isValidObjectId(jobId)) throw fail("Invalid job ID.");
    const job = await Job.findById(jobId).lean();
    if (!job) throw fail("Job not found.", 404);
    if (String(job.college) !== String(user.college)) throw fail("You can apply only to jobs from your own college.", 403);
    if (!user.isProfileCompleted || !user.resumeUrl) throw fail("Please complete your profile and upload your resume before applying.");
    if (job.deadline) { const deadline = new Date(job.deadline); deadline.setHours(23, 59, 59, 999); if (new Date() > deadline) throw fail("The application deadline for this job has passed."); }
    if (!meetsJobEligibility(job, user)) {
        if (job.minCgpa > 0 && (user.cgpa === undefined || user.cgpa < job.minCgpa)) throw fail(`You do not meet the minimum CGPA requirement of ${job.minCgpa}.`);
        throw fail(`This job is only open to students of: ${job.allowedBranches.join(", ")}.`);
    }
    try { return await Application.create({ student: studentId, job: jobId }); }
    catch (error) { if (error.code === 11000) throw fail("Already applied to this job.", 409); throw error; }
};
export const getMyApplications = async (studentId, queryParams) => {
    const page = Math.max(1, Number(queryParams.page) || 1); const limit = Math.min(50, Math.max(1, Number(queryParams.limit) || 5));
    const filter = { student: studentId }; const totalApplications = await Application.countDocuments(filter);
    const applications = await Application.find(filter).populate({ path: "job", populate: { path: "college", select: "name" } }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();
    return { applications, totalPages: Math.max(1, Math.ceil(totalApplications / limit)), currentPage: page, totalApplications };
};
export const getApplicantsByJob = async (jobId, actor) => {
    if (!mongoose.isValidObjectId(jobId)) throw fail("Invalid job ID.");
    const jobFilter = actor.role === "super_admin" ? { _id: jobId } : { _id: jobId, college: actor.college };
    const job = await Job.findOne(jobFilter).select("_id college").lean();
    if (!job) throw fail("Job not found in your college.", 404);
    return Application.find({ job: job._id }).populate("student", "name email cgpa branch graduationYear skills contactNumber resumeUrl verificationStatus").sort({ createdAt: -1 }).lean();
};
export const updateApplicationStatus = async (applicationId, status, actor) => {
    if (!statuses.includes(status)) throw fail("Invalid application status.");
    if (!mongoose.isValidObjectId(applicationId)) throw fail("Invalid application ID.");
    const app = await Application.findById(applicationId).populate("job", "college");
    if (!app) throw fail("Application not found.", 404);
    if (actor.role !== "super_admin" && String(app.job?.college) !== actor.college) throw fail("Application not found in your college.", 404);
    app.status = status; await app.save(); return app;
};
