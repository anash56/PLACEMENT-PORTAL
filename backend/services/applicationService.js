import mongoose from "mongoose";
import Application, { FINAL_APPLICATION_STATUSES, LEGACY_APPLICATION_STATUSES } from "../models/Application.js";
import Job from "../models/Job.js";
import User from "../models/User.js";
import College from "../models/College.js";
import { meetsJobEligibility } from "./eligibilityService.js";
import { isDeadlinePassed } from "./deadlineUtils.js";

const fail = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });
const STATUS_HISTORY_POPULATE = { path: "statusHistory.changedBy", select: "name role" };
const LEGACY_STAGE_HISTORY_POPULATE = { path: "stageHistory.changedBy", select: "name role" };
const LEGACY_STATUS_SET = new Set(LEGACY_APPLICATION_STATUSES);
const SELECTED_STATUSES = new Set(["Selected", "Offered"]);
const CLOSED_STATUSES = new Set(["Rejected", "Withdrawn"]);
const TERMINAL_STATUSES = [...SELECTED_STATUSES, ...CLOSED_STATUSES];

const LEGACY_FINAL_STATUSES = new Set(["Offered", ...FINAL_APPLICATION_STATUSES]);

function mergeLegacyActivity(application) {
    const statusHistory = Array.isArray(application.statusHistory) ? [...application.statusHistory] : [];
    const known = new Set(statusHistory.map(entry => `${entry.status}|${new Date(entry.changedAt || 0).getTime()}`));
    const legacyEvents = Array.isArray(application.stageHistory) ? application.stageHistory : [];

    for (const entry of legacyEvents) {
        const status = String(entry.stage || "").trim();
        if (!status) continue;
        const changedAt = entry.changedAt || application.updatedAt || application.createdAt;
        const key = `${status}|${new Date(changedAt || 0).getTime()}`;
        if (known.has(key)) continue;
        known.add(key);
        statusHistory.push({
            status,
            note: entry.note || "Stage update carried forward from the earlier workflow format.",
            changedBy: entry.changedBy || null,
            changedAt,
        });
    }

    const currentStage = String(application.currentStage || "").trim();
    const stageAlreadyRecorded = currentStage && (
        statusHistory.some(entry => entry.status === currentStage) ||
        legacyEvents.some(entry => String(entry.stage || "").trim() === currentStage)
    );
    if (currentStage && !stageAlreadyRecorded) {
        statusHistory.push({
            status: currentStage,
            note: "Current stage carried forward from the earlier workflow format.",
            changedBy: null,
            changedAt: application.updatedAt || application.createdAt,
        });
    }

    statusHistory.sort((a, b) => new Date(a.changedAt || 0) - new Date(b.changedAt || 0));
    return statusHistory;
}

function workflowSnapshot(application) {
    const copy = { ...application };
    copy.statusHistory = mergeLegacyActivity(application);

    let stages = Array.isArray(copy.workflowStages) && copy.workflowStages.length
        ? [...copy.workflowStages]
        : buildWorkflowStages(copy.job?.selectionStages);

    const legacyCurrentStage = String(copy.currentStage || "").trim();
    if (legacyCurrentStage && !LEGACY_FINAL_STATUSES.has(copy.status)) {
        copy.status = legacyCurrentStage;
        if (!stages.includes(legacyCurrentStage)) stages.push(legacyCurrentStage);
    }
    copy.workflowStages = stages;

    // Hide the previous two-track fields from every current UI/API response.
    delete copy.currentStage;
    delete copy.stageHistory;
    return copy;
}

function buildWorkflowStages(jobStages = []) {
    const seen = new Set(["submitted", "selected", "rejected", "withdrawn", "offered"]);
    const stages = ["Submitted"];
    for (const value of Array.isArray(jobStages) ? jobStages : []) {
        const stage = String(value || "").trim();
        const key = stage.toLocaleLowerCase();
        if (!stage || seen.has(key)) continue;
        seen.add(key);
        stages.push(stage);
    }
    return stages;
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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
    if (isDeadlinePassed(job.deadline)) {
        throw fail("The application deadline for this job has passed.");
    }
    if (!meetsJobEligibility(job, user)) {
        if (job.minCgpa > 0 && (user.cgpa === undefined || user.cgpa < job.minCgpa)) {
            throw fail(`You do not meet the minimum CGPA requirement of ${job.minCgpa}.`);
        }
        throw fail(`This job is only open to students of: ${(job.allowedBranches || []).join(", ")}.`);
    }

    try {
        return await Application.create({
            student: studentId,
            job: jobId,
            status: "Submitted",
            workflowStages: buildWorkflowStages(job.selectionStages),
            statusHistory: [{ status: "Submitted", note: "Application submitted.", changedBy: studentId }],
        });
    } catch (error) {
        if (error.code === 11000) throw fail("Already applied to this job.", 409);
        throw error;
    }
};

export const getMyApplications = async (studentId, queryParams = {}) => {
    const page = Math.max(1, Number(queryParams.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(queryParams.limit) || 5));
    const filter = { student: studentId };
    const category = String(queryParams.category || "all").trim().toLowerCase();
    const requestedStatus = String(queryParams.status || "").trim().slice(0, 80);
    const search = String(queryParams.search || "").trim().slice(0, 100);
    const statusClauses = [];

    if (category === "active") statusClauses.push({ status: { $nin: TERMINAL_STATUSES } });
    if (category === "selected") statusClauses.push({ status: { $in: [...SELECTED_STATUSES] } });
    if (category === "closed") statusClauses.push({ status: { $in: [...CLOSED_STATUSES] } });
    if (requestedStatus) statusClauses.push({ status: requestedStatus });
    if (statusClauses.length === 1) Object.assign(filter, statusClauses[0]);
    if (statusClauses.length > 1) filter.$and = statusClauses;

    // Search is limited to job title/company. Escape regex metacharacters so user input is literal.
    if (search) {
        const searchRegex = new RegExp(escapeRegex(search), "i");
        const matchingJobIds = await Job.find({ $or: [{ title: searchRegex }, { company: searchRegex }] }).distinct("_id");
        filter.job = { $in: matchingJobIds };
    }

    const sortKey = String(queryParams.sort || "updated");
    const sort = sortKey === "applied-oldest"
        ? { createdAt: 1, _id: 1 }
        : sortKey === "applied-newest"
            ? { createdAt: -1, _id: -1 }
            : { updatedAt: -1, createdAt: -1, _id: -1 };

    const studentObjectId = mongoose.isValidObjectId(studentId)
        ? new mongoose.Types.ObjectId(studentId)
        : studentId;
    const [totalApplications, allApplicationsCount, statusAggregation, availableStatuses, applications] = await Promise.all([
        Application.countDocuments(filter),
        Application.countDocuments({ student: studentId }),
        Application.aggregate([
            { $match: { student: studentObjectId } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        Application.distinct("status", { student: studentId }),
        Application.find(filter)
            .select("+currentStage +stageHistory")
            .populate({ path: "job", populate: { path: "college", select: "name" } })
            .populate(STATUS_HISTORY_POPULATE)
            .populate(LEGACY_STAGE_HISTORY_POPULATE)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
    ]);

    const categoryCounts = { all: allApplicationsCount, active: 0, selected: 0, closed: 0 };
    for (const item of statusAggregation) {
        const count = Number(item.count || 0);
        if (SELECTED_STATUSES.has(item._id)) categoryCounts.selected += count;
        else if (CLOSED_STATUSES.has(item._id)) categoryCounts.closed += count;
        else categoryCounts.active += count;
    }

    return {
        applications: applications.map(workflowSnapshot),
        totalPages: Math.max(1, Math.ceil(totalApplications / limit)),
        currentPage: page,
        totalApplications,
        allApplicationsCount,
        categoryCounts,
        availableStatuses: availableStatuses.filter(Boolean).sort((a, b) => String(a).localeCompare(String(b))),
    };
};

export const getApplicantsByJob = async (jobId, actor) => {
    if (!mongoose.isValidObjectId(jobId)) throw fail("Invalid job ID.");
    const jobFilter = actor.role === "super_admin" ? { _id: jobId } : { _id: jobId, college: actor.college };
    const job = await Job.findOne(jobFilter).select("_id college selectionStages").lean();
    if (!job) throw fail("Job not found in your college.", 404);

    const applications = await Application.find({ job: job._id })
        .select("+currentStage +stageHistory")
        .populate("job", "title company selectionStages")
        .populate("student", "name email cgpa branch graduationYear skills contactNumber resumeUrl verificationStatus")
        .populate(STATUS_HISTORY_POPULATE)
        .populate(LEGACY_STAGE_HISTORY_POPULATE)
        .sort({ createdAt: -1 })
        .lean();

    return applications.map(workflowSnapshot);
};

export const updateApplicationStatus = async (applicationId, updates = {}, actor) => {
    if (!mongoose.isValidObjectId(applicationId)) throw fail("Invalid application ID.");
    if (!updates || typeof updates !== "object" || Array.isArray(updates)) throw fail("Provide an application update.");

    const status = String(updates.status || "").trim();
    const note = String(updates.note || "").trim();
    if (!status) throw fail("Choose a workflow stage or final outcome.");
    if (status.length > 80) throw fail("Application status must be 80 characters or fewer.");
    if (note.length > 500) throw fail("Update notes must be 500 characters or fewer.");

    const application = await Application.findById(applicationId)
        .select("+currentStage +stageHistory")
        .populate("job", "college selectionStages")
        .populate(STATUS_HISTORY_POPULATE)
        .populate(LEGACY_STAGE_HISTORY_POPULATE);
    if (!application) throw fail("Application not found.", 404);
    const jobCollege = application.job?.college?._id || application.job?.college;
    if (actor.role !== "super_admin" && String(jobCollege) !== actor.college) {
        throw fail("Application not found in your college.", 404);
    }

    // Fold older stage history into the one activity/status track and clear the legacy duplicate fields.
    const legacyCurrentStage = String(application.currentStage || "").trim();
    application.statusHistory = mergeLegacyActivity(application).map(entry => ({
        status: entry.status,
        note: entry.note || "",
        changedBy: entry.changedBy?._id || entry.changedBy || null,
        changedAt: entry.changedAt || application.createdAt || new Date(),
    }));
    if (legacyCurrentStage && !LEGACY_FINAL_STATUSES.has(application.status)) {
        application.status = legacyCurrentStage;
    }
    application.currentStage = "";
    application.stageHistory = [];

    // Older applications receive a stable snapshot on first update. Later job edits won't affect it.
    if (!Array.isArray(application.workflowStages) || application.workflowStages.length === 0) {
        application.workflowStages = buildWorkflowStages(application.job?.selectionStages);
    }
    if (legacyCurrentStage && !application.workflowStages.includes(legacyCurrentStage)) {
        application.workflowStages.push(legacyCurrentStage);
    }
    if (!LEGACY_FINAL_STATUSES.has(application.status) && !LEGACY_STATUS_SET.has(application.status) && !application.workflowStages.includes(application.status)) {
        application.workflowStages.push(application.status);
    }
    const allowedStatuses = new Set([...application.workflowStages, ...FINAL_APPLICATION_STATUSES]);

    // Existing older values stay visible as the current state, but are not added as new global stages.
    if (LEGACY_STATUS_SET.has(application.status) || ["Offered", "Shortlisted"].includes(application.status)) {
        allowedStatuses.add(application.status);
    }
    if (!allowedStatuses.has(status)) {
        throw fail("Choose a stage configured for this application's job, or a standard final outcome.");
    }
    if (status === application.status) throw fail("The application is already at that status.");

    application.status = status;
    application.statusHistory.push({ status, note, changedBy: actor.id });
    await application.save();
    await application.populate([
        { path: "student", select: "name email cgpa branch graduationYear skills contactNumber resumeUrl verificationStatus" },
        { path: "job", select: "title company college selectionStages" },
        STATUS_HISTORY_POPULATE,
    ]);
    return application;
};
