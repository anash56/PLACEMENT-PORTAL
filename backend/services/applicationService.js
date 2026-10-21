import mongoose from "mongoose";
import Application, { ALL_APPLICATION_STATUSES } from "../models/Application.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import College from "../models/College.js";
import { meetsJobEligibility } from "./eligibilityService.js";

const fail = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });
const STATUS_HISTORY_POPULATE = { path: "statusHistory.changedBy", select: "name role" };
const STAGE_HISTORY_POPULATE = { path: "stageHistory.changedBy", select: "name role" };

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
    if (job.deadline) {
        const deadline = new Date(job.deadline);
        deadline.setHours(23, 59, 59, 999);
        if (new Date() > deadline) throw fail("The application deadline for this job has passed.");
    }
    if (!meetsJobEligibility(job, user)) {
        if (job.minCgpa > 0 && (user.cgpa === undefined || user.cgpa < job.minCgpa)) throw fail(`You do not meet the minimum CGPA requirement of ${job.minCgpa}.`);
        throw fail(`This job is only open to students of: ${(job.allowedBranches || []).join(", ")}.`);
    }

    const applicationData = {
        student: studentId,
        job: jobId,
        status: "Submitted",
        statusHistory: [{ status: "Submitted", note: "Application submitted.", changedBy: studentId }],
        // Do not assume a recruitment stage has happened just because the job defines it.
        // The placement team records a stage only after it actually occurs.
        currentStage: "",
        stageHistory: [],
    };
    try {
        return await Application.create(applicationData);
    } catch (error) {
        if (error.code === 11000) throw fail("Already applied to this job.", 409);
        throw error;
    }
};

export const getMyApplications = async (studentId, queryParams) => {
    const page = Math.max(1, Number(queryParams.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(queryParams.limit) || 5));
    const filter = { student: studentId };
    const totalApplications = await Application.countDocuments(filter);
    const applications = await Application.find(filter)
        .populate({ path: "job", populate: { path: "college", select: "name" } })
        .populate(STATUS_HISTORY_POPULATE)
        .populate(STAGE_HISTORY_POPULATE)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
    return { applications, totalPages: Math.max(1, Math.ceil(totalApplications / limit)), currentPage: page, totalApplications };
};

export const getApplicantsByJob = async (jobId, actor) => {
    if (!mongoose.isValidObjectId(jobId)) throw fail("Invalid job ID.");
    const jobFilter = actor.role === "super_admin" ? { _id: jobId } : { _id: jobId, college: actor.college };
    const job = await Job.findOne(jobFilter).select("_id college").lean();
    if (!job) throw fail("Job not found in your college.", 404);
    return Application.find({ job: job._id })
        .populate("job", "title company selectionStages")
        .populate("student", "name email cgpa branch graduationYear skills contactNumber resumeUrl verificationStatus")
        .populate(STATUS_HISTORY_POPULATE)
        .populate(STAGE_HISTORY_POPULATE)
        .sort({ createdAt: -1 })
        .lean();
};

export const updateApplicationStatus = async (applicationId, updates = {}, actor) => {
    if (!mongoose.isValidObjectId(applicationId)) throw fail("Invalid application ID.");
    if (!updates || typeof updates !== "object" || Array.isArray(updates)) throw fail("Provide an application update.");

    const hasStatus = Object.prototype.hasOwnProperty.call(updates, "status");
    const hasStage = Object.prototype.hasOwnProperty.call(updates, "stage");
    if (!hasStatus && !hasStage) throw fail("Choose a status or a selection stage to update.");

    const status = hasStatus ? String(updates.status || "").trim() : undefined;
    const stage = hasStage ? String(updates.stage || "").trim() : undefined;
    const note = String(updates.note || "").trim();
    if (note.length > 500) throw fail("Update notes must be 500 characters or fewer.");
    if (hasStatus && !ALL_APPLICATION_STATUSES.includes(status)) throw fail("Invalid application status.");
    if (!mongoose.isValidObjectId(applicationId)) throw fail("Invalid application ID.");

    const application = await Application.findById(applicationId).populate("job", "college selectionStages");
    if (!application) throw fail("Application not found.", 404);
    if (actor.role !== "super_admin" && String(application.job?.college?._id || application.job?.college) !== actor.college) {
        throw fail("Application not found in your college.", 404);
    }

    let changed = false;
    if (hasStatus && status !== application.status) {
        application.status = status;
        application.statusHistory.push({ status, note, changedBy: actor.id });
        changed = true;
    }

    if (hasStage && stage !== application.currentStage) {
        const stages = Array.isArray(application.job?.selectionStages) ? application.job.selectionStages : [];
        if (stage && stages.length === 0) throw fail("This job does not have custom selection stages. Configure them in Edit Job first.");
        if (stage && !stages.includes(stage)) throw fail("Choose a stage configured for this job.");
        application.currentStage = stage;
        application.stageHistory.push({
            stage: stage || "Stage unassigned",
            note: note || (stage ? "Hiring stage updated." : "No active selection stage is currently assigned."),
            changedBy: actor.id,
        });
        changed = true;
    }

    if (!changed) throw fail("No changes to save.");
    await application.save();
    await application.populate([
        { path: "student", select: "name email cgpa branch graduationYear skills contactNumber resumeUrl verificationStatus" },
        { path: "job", select: "title company college selectionStages" },
        STATUS_HISTORY_POPULATE,
        STAGE_HISTORY_POPULATE,
    ]);
    return application;
};
