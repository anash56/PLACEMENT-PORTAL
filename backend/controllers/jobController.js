import * as jobService from "../services/jobService.js";
const sendError = (res, error) => res.status(error.statusCode || 500).json({ message: error.message || "Request failed." });
export const createJob = async (req, res) => { try { return res.status(201).json(await jobService.createJob(req.body, req.user)); } catch (e) { return sendError(res, e); } };
export const getJobs = async (req, res) => { try { return res.json(await jobService.getJobs(req.query, req.user)); } catch (e) { return sendError(res, e); } };
export const getJobById = async (req, res) => { try { return res.json(await jobService.getJobById(req.params.id, req.user)); } catch (e) { return sendError(res, e); } };
export const updateJob = async (req, res) => { try { return res.json({ message: "Job updated successfully.", job: await jobService.updateJob(req.params.id, req.body, req.user) }); } catch (e) { return sendError(res, e); } };
export const deleteJob = async (req, res) => { try { return res.json(await jobService.deleteJob(req.params.id, req.user)); } catch (e) { return sendError(res, e); } };
