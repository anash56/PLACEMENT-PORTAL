import Application from "../models/Application.js";
import Job from "../models/Job.js";
import User from "../models/User.js";

export const applyJob = async (req, res) => {

    try {

        if (req.user.role !== "student") {

            return res.status(403).json({

                message: "Only students can apply for jobs."

            });

        }
        const jobId = req.params.jobId;

        const job = await Job.findById(jobId).lean();

        if (!job) {
            return res.status(404).json({
                message: "Job Not Found"
            });
        }

        // Fetch student profile details
        const user = await User.findById(req.user.id).lean();
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // 1. Check Profile Completeness & Resume Upload
        if (!user.isProfileCompleted || !user.resumeUrl) {
            return res.status(400).json({
                message: "Please complete your profile and upload your resume before applying."
            });
        }

        // 2. Check Job Deadline
        if (job.deadline && new Date() > new Date(job.deadline)) {
            return res.status(400).json({
                message: "The application deadline for this job has passed."
            });
        }

        // 3. Check CGPA eligibility
        if (job.minCgpa !== undefined && job.minCgpa !== null && job.minCgpa > 0) {
            if (!user.cgpa || user.cgpa < job.minCgpa) {
                return res.status(400).json({
                    message: `You do not meet the minimum CGPA requirement of ${job.minCgpa} for this job. Your CGPA is ${user.cgpa || 0}.`
                });
            }
        }

        // 4. Check Branch eligibility (case-insensitive)
        if (job.allowedBranches && job.allowedBranches.length > 0) {
            const studentBranch = user.branch ? user.branch.trim().toLowerCase() : "";
            const isAllowed = job.allowedBranches.some(
                (b) => b.trim().toLowerCase() === studentBranch
            );
            if (!isAllowed) {
                return res.status(400).json({
                    message: `This job is only open to students of: ${job.allowedBranches.join(", ")}. Your Branch is ${user.branch || "not specified"}.`
                });
            }
        }

        const existingApplication =
            await Application.findOne({
                student: req.user.id,
                job: jobId
            }).lean();

        if (existingApplication) {
            return res.status(400).json({
                message: "Already Applied"
            });
        }

        const application =
            await Application.create({

                student: req.user.id,
                job: jobId

            });

        res.status(201).json({
            message: "Application Submitted",
            application
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};


export const getMyApplications =
    async (req, res) => {

        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 5;
            const skip = (page - 1) * limit;

            const totalApplications = await Application.countDocuments({
                student: req.user.id
            });

            const applications =
                await Application.find({
                    student: req.user.id
                })
                    .populate("job")
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean();

            res.status(200).json({
                applications,
                totalPages: Math.max(1, Math.ceil(totalApplications / limit)),
                currentPage: page,
                totalApplications
            });

        } catch (error) {

            res.status(500).json({
                message: error.message
            });

        }

    };


export const getApplicantsByJob =
    async (req, res) => {

        try {

            const applications =
                await Application.find({
                    job: req.params.jobId
                })
                    .populate(
                        "student",
                        "name email cgpa branch graduationYear skills contactNumber resumeUrl"
                    )
                    .lean();

            res.status(200).json(
                applications
            );

        } catch (error) {

            res.status(500).json({
                message: error.message
            });

        }

    };

export const updateApplicationStatus =
    async (req, res) => {

        try {

            const { status } = req.body;

            const validStatuses = [
                "Pending",
                "Test Scheduled",
                "Interview Scheduled",
                "Shortlisted",
                "Offered",
                "Rejected"
            ];

            if (
                !validStatuses.includes(status)
            ) {
                return res.status(400).json({
                    message: "Invalid Status"
                });
            }

            const application =
                await Application.findById(
                    req.params.id
                );

            if (!application) {
                return res.status(404).json({
                    message: "Application Not Found"
                });
            }

            application.status = status;

            await application.save();

            res.status(200).json({
                message: "Status Updated",
                application
            });

        } catch (error) {

            res.status(500).json({
                message: error.message
            });

        }

    };