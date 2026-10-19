import * as applicationService from "../services/applicationService.js";
const sendError = (res, error) => res.status(error.statusCode || 500).json({ message: error.message || "Request failed." });
export const applyJob = async (req, res) => { try { return res.status(201).json({ message: "Application submitted.", application: await applicationService.applyJob(req.user.id, req.user.role, req.params.jobId) }); } catch (e) { return sendError(res, e); } };
export const getMyApplications = async (req, res) => { try { return res.json(await applicationService.getMyApplications(req.user.id, req.query)); } catch (e) { return sendError(res, e); } };
export const getApplicantsByJob = async (req, res) => { try { return res.json(await applicationService.getApplicantsByJob(req.params.jobId, req.user)); } catch (e) { return sendError(res, e); } };
export const updateApplicationStatus = async (req, res) => { try { return res.json({ message: "Application status updated.", application: await applicationService.updateApplicationStatus(req.params.id, req.body.status, req.user) }); } catch (e) { return sendError(res, e); } };
