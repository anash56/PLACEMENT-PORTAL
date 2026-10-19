import * as dashboardService from "../services/dashboardService.js";
export const getDashboardStats = async (req, res) => {
    try { return res.json(await dashboardService.getDashboardStats(req.user)); }
    catch (error) { return res.status(error.statusCode || 500).json({ message: error.message || "Unable to load dashboard." }); }
};
