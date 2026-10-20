import User from "../models/User.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import mongoose from "mongoose";

const zero = { averageSalary: 0, maxSalary: 0, minSalary: 0 };
const zeroPlaced = { averagePlacedSalary: 0, maxPlacedSalary: 0, minPlacedSalary: 0 };
const fail = (message, statusCode = 400) => Object.assign(new Error(message), { statusCode });

export const getDashboardStats = async ({ role, college } = {}) => {
    const isCollegeAdmin = role === "college_admin";
    const isSuperAdmin = role === "super_admin";

    // Fail closed. A college admin without a valid college must never receive global statistics.
    if (!isCollegeAdmin && !isSuperAdmin) {
        throw fail("Administrator access required.", 403);
    }
    if (isCollegeAdmin && !mongoose.isValidObjectId(college)) {
        throw fail("Your admin account is not linked to a valid college.", 403);
    }

    const collegeId = isCollegeAdmin ? new mongoose.Types.ObjectId(college) : null;
    const userFilter = { role: "student", ...(collegeId ? { college: collegeId } : {}) };
    const jobFilter = collegeId ? { college: collegeId } : {};
    const jobs = await Job.find(jobFilter).select("_id salary").lean();
    const jobIds = jobs.map(job => job._id);
    const appFilter = collegeId ? { job: { $in: jobIds } } : {};

    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const deadlineFilter = { ...jobFilter, deadline: { $gte: now, $lte: sevenDaysFromNow } };

    const [
        totalStudents,
        totalJobs,
        totalApplications,
        statusAggregation,
        branchAggregation,
        salaryAggregation,
        placedAggregation,
        pendingStudentVerifications,
        upcomingDeadlineCount,
        upcomingDeadlines,
        recentJobs,
        recentApplications,
    ] = await Promise.all([
        User.countDocuments(userFilter),
        Job.countDocuments(jobFilter),
        Application.countDocuments(appFilter),
        Application.aggregate([
            { $match: appFilter },
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        User.aggregate([
            { $match: userFilter },
            { $group: { _id: "$branch", count: { $sum: 1 } } },
        ]),
        Job.aggregate([
            { $match: jobFilter },
            { $group: { _id: null, averageSalary: { $avg: "$salary" }, maxSalary: { $max: "$salary" }, minSalary: { $min: "$salary" } } },
        ]),
        Application.aggregate([
            { $match: { ...appFilter, status: "Offered" } },
            { $lookup: { from: "jobs", localField: "job", foreignField: "_id", as: "jobDetails" } },
            { $unwind: "$jobDetails" },
            ...(collegeId ? [{ $match: { "jobDetails.college": collegeId } }] : []),
            { $group: { _id: null, averagePlacedSalary: { $avg: "$jobDetails.salary" }, maxPlacedSalary: { $max: "$jobDetails.salary" }, minPlacedSalary: { $min: "$jobDetails.salary" } } },
        ]),
        isCollegeAdmin
            ? User.countDocuments({ ...userFilter, verificationStatus: "pending" })
            : Promise.resolve(0),
        isCollegeAdmin ? Job.countDocuments(deadlineFilter) : Promise.resolve(0),
        isCollegeAdmin
            ? Job.find(deadlineFilter)
                .select("_id title company deadline")
                .sort({ deadline: 1 })
                .limit(5)
                .lean()
            : Promise.resolve([]),
        isCollegeAdmin
            ? Job.find(jobFilter)
                .select("_id title company location salary minCgpa allowedBranches deadline createdAt")
                .sort({ createdAt: -1 })
                .limit(4)
                .lean()
            : Promise.resolve([]),
        isCollegeAdmin
            ? Application.find(appFilter)
                .select("_id student job status createdAt updatedAt")
                .populate({ path: "student", select: "name branch cgpa graduationYear" })
                .populate({ path: "job", select: "title company deadline" })
                .sort({ createdAt: -1 })
                .limit(6)
                .lean()
            : Promise.resolve([]),
    ]);

    const statusBreakdown = {
        Pending: 0,
        "Test Scheduled": 0,
        "Interview Scheduled": 0,
        Shortlisted: 0,
        Offered: 0,
        Rejected: 0,
    };
    statusAggregation.forEach(item => {
        if (statusBreakdown[item._id] !== undefined) statusBreakdown[item._id] = item.count;
    });

    const salary = salaryAggregation[0] || zero;
    const placed = placedAggregation[0] || zeroPlaced;

    return {
        totalStudents,
        totalJobs,
        totalApplications,
        statusBreakdown,
        branchBreakdown: branchAggregation.map(item => ({
            name: item._id?.trim() || "Unspecified",
            value: item.count,
        })),
        salaryStats: {
            averageSalary: Math.round(salary.averageSalary || 0),
            maxSalary: salary.maxSalary || 0,
            minSalary: salary.minSalary || 0,
        },
        placedSalaryStats: {
            averagePlacedSalary: Math.round(placed.averagePlacedSalary || 0),
            maxPlacedSalary: placed.maxPlacedSalary || 0,
            minPlacedSalary: placed.minPlacedSalary || 0,
        },
        pendingStudentVerifications,
        upcomingDeadlineCount,
        upcomingDeadlines,
        recentJobs,
        recentApplications,
    };
};
