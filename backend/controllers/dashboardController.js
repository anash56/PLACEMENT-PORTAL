import User from "../models/User.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";

export const getDashboardStats =
    async (req, res) => {

        try {

            const totalStudents =
                await User.countDocuments({

                    role: "student"

                });

            const totalJobs =
                await Job.countDocuments();

            const totalApplications =
                await Application.countDocuments();

            // 1. Application status distribution
            const statusAggregation = await Application.aggregate([
                { $group: { _id: "$status", count: { $sum: 1 } } }
            ]);

            const statusBreakdown = {
                Pending: 0,
                "Test Scheduled": 0,
                "Interview Scheduled": 0,
                Shortlisted: 0,
                Offered: 0,
                Rejected: 0
            };

            statusAggregation.forEach(item => {
                if (statusBreakdown[item._id] !== undefined) {
                    statusBreakdown[item._id] = item.count;
                }
            });

            // 2. Student count grouped by Branch
            const branchAggregation = await User.aggregate([
                { $match: { role: "student" } },
                { $group: { _id: "$branch", count: { $sum: 1 } } }
            ]);

            const branchBreakdown = branchAggregation.map(item => ({
                name: item._id && item._id.trim() !== "" ? item._id : "Unspecified",
                value: item.count
            }));

            // 3. Job salary statistics
            const salaryAggregation = await Job.aggregate([
                {
                    $group: {
                        _id: null,
                        averageSalary: { $avg: "$salary" },
                        maxSalary: { $max: "$salary" },
                        minSalary: { $min: "$salary" }
                    }
                }
            ]);

            const salaryStats = salaryAggregation[0] || {
                averageSalary: 0,
                maxSalary: 0,
                minSalary: 0
            };

            // 4. Placed student salary statistics (applications status: "Offered")
            const placedSalaryAggregation = await Application.aggregate([
                { $match: { status: "Offered" } },
                {
                    $lookup: {
                        from: "jobs",
                        localField: "job",
                        foreignField: "_id",
                        as: "jobDetails"
                    }
                },
                { $unwind: "$jobDetails" },
                {
                    $group: {
                        _id: null,
                        averagePlacedSalary: { $avg: "$jobDetails.salary" },
                        maxPlacedSalary: { $max: "$jobDetails.salary" },
                        minPlacedSalary: { $min: "$jobDetails.salary" }
                    }
                }
            ]);

            const placedSalaryStats = placedSalaryAggregation[0] || {
                averagePlacedSalary: 0,
                maxPlacedSalary: 0,
                minPlacedSalary: 0
            };

            res.status(200).json({

                totalStudents,

                totalJobs,

                totalApplications,

                statusBreakdown,

                branchBreakdown,

                salaryStats: {
                    averageSalary: Math.round(salaryStats.averageSalary),
                    maxSalary: salaryStats.maxSalary,
                    minSalary: salaryStats.minSalary
                },

                placedSalaryStats: {
                    averagePlacedSalary: Math.round(placedSalaryStats.averagePlacedSalary),
                    maxPlacedSalary: placedSalaryStats.maxPlacedSalary,
                    minPlacedSalary: placedSalaryStats.minPlacedSalary
                }

            });

        } catch (error) {

            res.status(500).json({
                message: error.message
            });

        }

    };