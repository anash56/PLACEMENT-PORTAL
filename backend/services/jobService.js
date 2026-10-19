import mongoose from "mongoose";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import College from "../models/College.js";
import { meetsJobEligibility } from "./eligibilityService.js";
const fail = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });
const escapeRegex = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const ensureJobCollegeActive = async collegeId => {
    const college = await College.findById(collegeId).select("status").lean();
    if (!college || college.status !== "approved") throw fail("This college is not approved and active.", 403);
};

export const createJob = async (jobData, actor) => {
    await ensureJobCollegeActive(actor.college);
    const { title, company, location, salary, description, minCgpa, allowedBranches, deadline } = jobData;
    if (!title || !company || !location || !description || !Number.isFinite(Number(salary)) || Number(salary) < 0) throw fail("Provide valid job details.");
    if (minCgpa !== undefined && (Number(minCgpa) < 0 || Number(minCgpa) > 10)) throw fail("Minimum CGPA must be between 0 and 10.");
    const branches = Array.isArray(allowedBranches) ? allowedBranches : [];
    const job = await Job.create({ title, company, location, salary: Number(salary), description, minCgpa: minCgpa === "" || minCgpa === undefined ? 0 : Number(minCgpa), allowedBranches: branches.map(x => String(x).trim()).filter(Boolean), deadline: deadline || null, createdBy: actor.id, college: actor.college });
    return job;
};

export const getJobs = async (queryParams, actor) => {
    if (!actor) throw fail("Authentication required.", 401);
    const keyword = String(queryParams.keyword || "").trim().slice(0, 100);
    const location = String(queryParams.location || "").trim().slice(0, 100);
    const sort = queryParams.sort;
    const page = Math.max(1, Number(queryParams.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(queryParams.limit) || 5));
    const filter = {};
    if (actor.role === "student") {
        if (!actor.college) return { totalJobs: 0, currentPage: page, totalPages: 1, jobs: [] };
        filter.college = new mongoose.Types.ObjectId(actor.college);
        if (actor.collegeStatus !== "approved" || actor.verificationStatus !== "verified") return { totalJobs: 0, currentPage: page, totalPages: 1, jobs: [], accessMessage: actor.verificationStatus === "verified" ? "Your college is not active." : "Complete college verification to view available jobs." };
        // Exact CGPA and case-insensitive branch matching are applied to the full college-scoped result below,
        // before pagination, so differently-cased branch names are not accidentally omitted by Mongo queries.
    } else if (actor.role === "college_admin") filter.college = new mongoose.Types.ObjectId(actor.college);
    else if (actor.role !== "super_admin") throw fail("You do not have permission to view jobs.", 403);
    if (keyword) { const regex = new RegExp(escapeRegex(keyword), "i"); filter.$and = [...(filter.$and || []), { $or: [{ title: regex }, { company: regex }, { description: regex }] }]; }
    if (location) filter.location = { $regex: escapeRegex(location), $options: "i" };
    let query = Job.find(filter).populate("createdBy", "name email").populate("college", "name").lean();
    if (sort === "salary") query = query.sort({ salary: -1 }); else query = query.sort({ createdAt: -1 });
    // For student feeds filter before pagination so pages and totals remain correct and branch comparison is consistently case-insensitive.
    if (actor.role === "student") {
        const matching = (await query).filter(job => meetsJobEligibility(job, actor));
        const totalJobs = matching.length;
        const jobs = matching.slice((page - 1) * limit, page * limit);
        return { totalJobs, currentPage: page, totalPages: Math.max(1, Math.ceil(totalJobs / limit)), jobs };
    }
    const totalJobs = await Job.countDocuments(filter);
    const jobs = await query.skip((page - 1) * limit).limit(limit);
    return { totalJobs, currentPage: page, totalPages: Math.max(1, Math.ceil(totalJobs / limit)), jobs };
};

export const getJobById = async (jobId, actor) => {
    if (!mongoose.isValidObjectId(jobId)) throw fail("Invalid job ID.");
    const job = await Job.findById(jobId).populate("createdBy", "name email").populate("college", "name").lean();
    if (!job) throw fail("Job not found.", 404);
    if (actor.role === "college_admin" && String(job.college?._id || job.college) !== actor.college) throw fail("Job not found.", 404);
    if (actor.role === "student") {
        if (String(job.college?._id || job.college) !== actor.college) throw fail("Job not found.", 404);
        if (actor.verificationStatus !== "verified" || actor.collegeStatus !== "approved") throw fail("Verify your college affiliation before viewing job details.", 403);
        if (!meetsJobEligibility(job, actor)) throw fail("This job does not match your CGPA or branch eligibility.", 403);
    } else if (!["college_admin", "super_admin"].includes(actor.role)) throw fail("Forbidden.", 403);
    return job;
};

export const updateJob = async (jobId, updateData, actor) => {
    if (!mongoose.isValidObjectId(jobId)) throw fail("Invalid job ID.");
    const allowed = ["title", "company", "location", "salary", "description", "minCgpa", "allowedBranches", "deadline"];
    const clean = Object.fromEntries(Object.entries(updateData).filter(([key]) => allowed.includes(key)));
    if (clean.minCgpa !== undefined && (Number(clean.minCgpa) < 0 || Number(clean.minCgpa) > 10)) throw fail("Minimum CGPA must be between 0 and 10.");
    if (clean.salary !== undefined && (!Number.isFinite(Number(clean.salary)) || Number(clean.salary) < 0)) throw fail("Salary must be a non-negative number.");
    if (clean.allowedBranches !== undefined) clean.allowedBranches = Array.isArray(clean.allowedBranches) ? clean.allowedBranches.map(x => String(x).trim()).filter(Boolean) : [];
    const job = await Job.findOneAndUpdate({ _id: jobId, college: actor.college }, clean, { new: true, runValidators: true });
    if (!job) throw fail("Job not found in your college.", 404);
    return job;
};

export const deleteJob = async (jobId, actor) => {
    if (!mongoose.isValidObjectId(jobId)) throw fail("Invalid job ID.");
    const job = await Job.findOneAndDelete({ _id: jobId, college: actor.college });
    if (!job) throw fail("Job not found in your college.", 404);
    await Application.deleteMany({ job: jobId });
    return { message: "Job deleted successfully." };
};
