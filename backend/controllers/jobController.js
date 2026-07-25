import * as jobService from "../services/jobService.js";

export const createJob = async (req, res) => {
    try {
        const job = await jobService.createJob(req.body, req.user.id);
        res.status(201).json(job);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message
        });
    }
};

export const getJobs = async (req, res) => {
    try {
        const result = await jobService.getJobs(req.query);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message
        });
    }
};

export const getJobById = async (req, res) => {
    try {
        const job = await jobService.getJobById(req.params.id);
        res.status(200).json(job);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message
        });
    }
};

export const updateJob = async (req, res) => {
    try {
        const job = await jobService.updateJob(req.params.id, req.body);
        res.status(200).json({
            message: "Job Updated Successfully",
            job
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message
        });
    }
};

export const deleteJob = async (req, res) => {
    try {
        const result = await jobService.deleteJob(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message
        });
    }
};