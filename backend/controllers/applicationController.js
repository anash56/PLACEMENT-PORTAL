import * as applicationService from "../services/applicationService.js";

export const applyJob = async (req, res) => {
    try {
        const application = await applicationService.applyJob(
            req.user.id,
            req.user.role,
            req.params.jobId
        );
        res.status(201).json({
            message: "Application Submitted",
            application
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message
        });
    }
};

export const getMyApplications = async (req, res) => {
    try {
        const result = await applicationService.getMyApplications(req.user.id, req.query);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message
        });
    }
};

export const getApplicantsByJob = async (req, res) => {
    try {
        const applications = await applicationService.getApplicantsByJob(req.params.jobId);
        res.status(200).json(applications);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message
        });
    }
};

export const updateApplicationStatus = async (req, res) => {
    try {
        const application = await applicationService.updateApplicationStatus(
            req.params.id,
            req.body.status
        );
        res.status(200).json({
            message: "Status Updated",
            application
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message
        });
    }
};