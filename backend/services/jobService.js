import Job from "../models/Job.js";
import Application from "../models/Application.js";

const createCustomError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

export const createJob = async (jobData, createdById) => {
    const job = await Job.create({
        ...jobData,
        createdBy: createdById
    });
    return job;
};

export const getJobs = async (queryParams) => {
    const keyword = queryParams.keyword || "";
    const location = queryParams.location || "";
    const sort = queryParams.sort;
    const page = Number(queryParams.page) || 1;
    const limit = Number(queryParams.limit) || 5;
    const skip = (page - 1) * limit;

    const query = {};

    if (keyword) {
        const regex = new RegExp(keyword, "i");
        query.$or = [
            { title: regex },
            { company: regex },
            { description: regex }
        ];
    }

    if (location) {
        query.location = {
            $regex: location,
            $options: "i"
        };
    }

    const totalJobs = await Job.countDocuments(query);

    let jobsQuery = Job.find(query)
        .populate("createdBy", "name email")
        .lean();

    if (sort === "salary") {
        jobsQuery = jobsQuery.sort({ salary: -1 });
    }

    if (sort === "latest") {
        jobsQuery = jobsQuery.sort({ createdAt: -1 });
    }

    const jobs = await jobsQuery.skip(skip).limit(limit);

    return {
        totalJobs,
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(totalJobs / limit)),
        jobs
    };
};

export const getJobById = async (jobId) => {
    const job = await Job.findById(jobId)
        .populate("createdBy", "name email")
        .lean();

    if (!job) {
        throw createCustomError("Job Not Found", 404);
    }

    return job;
};

export const updateJob = async (jobId, updateData) => {
    const job = await Job.findByIdAndUpdate(
        jobId,
        updateData,
        {
            new: true,
            runValidators: true
        }
    );

    if (!job) {
        throw createCustomError("Job Not Found", 404);
    }

    return job;
};

export const deleteJob = async (jobId) => {
    const job = await Job.findByIdAndDelete(jobId);

    if (!job) {
        throw createCustomError("Job Not Found", 404);
    }

    await Application.deleteMany({ job: jobId });

    return { message: "Job Deleted Successfully" };
};
