import Application from "../models/Application.js";
import Job from "../models/Job.js";
import User from "../models/User.js";

const createCustomError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

export const applyJob = async (studentId, role, jobId) => {
    if (role !== "student") {
        throw createCustomError("Only students can apply for jobs.", 403);
    }

    const job = await Job.findById(jobId).lean();
    if (!job) {
        throw createCustomError("Job Not Found", 404);
    }

    const user = await User.findById(studentId).lean();
    if (!user) {
        throw createCustomError("User not found", 404);
    }

    if (!user.isProfileCompleted || !user.resumeUrl) {
        throw createCustomError("Please complete your profile and upload your resume before applying.", 400);
    }

    if (job.deadline) {
        const deadlineDate = new Date(job.deadline);
        deadlineDate.setHours(23, 59, 59, 999);
        if (new Date() > deadlineDate) {
            throw createCustomError("The application deadline for this job has passed.", 400);
        }
    }

    if (job.minCgpa !== undefined && job.minCgpa !== null && job.minCgpa > 0) {
        if (!user.cgpa || user.cgpa < job.minCgpa) {
            throw createCustomError(
                `You do not meet the minimum CGPA requirement of ${job.minCgpa} for this job. Your CGPA is ${user.cgpa || 0}.`,
                400
            );
        }
    }

    if (job.allowedBranches && job.allowedBranches.length > 0) {
        const studentBranch = user.branch ? user.branch.trim().toLowerCase() : "";
        const isAllowed = job.allowedBranches.some(
            (b) => b.trim().toLowerCase() === studentBranch
        );
        if (!isAllowed) {
            throw createCustomError(
                `This job is only open to students of: ${job.allowedBranches.join(", ")}. Your Branch is ${user.branch || "not specified"}.`,
                400
            );
        }
    }

    const existingApplication = await Application.findOne({
        student: studentId,
        job: jobId
    }).lean();

    if (existingApplication) {
        throw createCustomError("Already Applied", 400);
    }

    const application = await Application.create({
        student: studentId,
        job: jobId
    });

    return application;
};

export const getMyApplications = async (studentId, queryParams) => {
    const page = Number(queryParams.page) || 1;
    const limit = Number(queryParams.limit) || 5;
    const skip = (page - 1) * limit;

    const totalApplications = await Application.countDocuments({
        student: studentId
    });

    const applications = await Application.find({
        student: studentId
    })
        .populate("job")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    return {
        applications,
        totalPages: Math.max(1, Math.ceil(totalApplications / limit)),
        currentPage: page,
        totalApplications
    };
};

export const getApplicantsByJob = async (jobId) => {
    const applications = await Application.find({
        job: jobId
    })
        .populate(
            "student",
            "name email cgpa branch graduationYear skills contactNumber resumeUrl"
        )
        .lean();

    return applications;
};

export const updateApplicationStatus = async (applicationId, status) => {
    const validStatuses = [
        "Pending",
        "Test Scheduled",
        "Interview Scheduled",
        "Shortlisted",
        "Offered",
        "Rejected"
    ];

    if (!validStatuses.includes(status)) {
        throw createCustomError("Invalid Status", 400);
    }

    const application = await Application.findById(applicationId);
    if (!application) {
        throw createCustomError("Application Not Found", 404);
    }

    application.status = status;
    await application.save();

    return application;
};
