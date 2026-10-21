import * as applicationService from "../services/applicationService.js";

const sendError = (res, error) => res.status(error.statusCode || 500).json({ message: error.message || "Request failed." });

export const applyJob = async (req, res) => {
    try {
        const application = await applicationService.applyJob(req.user.id, req.user.role, req.params.jobId);
        return res.status(201).json({ message: "Application submitted.", application });
    } catch (error) {
        return sendError(res, error);
    }
};

export const getMyApplications = async (req, res) => {
    try { return res.json(await applicationService.getMyApplications(req.user.id, req.query)); }
    catch (error) { return sendError(res, error); }
};

export const getApplicantsByJob = async (req, res) => {
    try { return res.json(await applicationService.getApplicantsByJob(req.params.jobId, req.user)); }
    catch (error) { return sendError(res, error); }
};

export const updateApplicationStatus = async (req, res) => {
    try {
        const application = await applicationService.updateApplicationStatus(req.params.id, req.body, req.user);
        return res.json({ message: "Application updated.", application });
    } catch (error) {
        return sendError(res, error);
    }
};
