import * as collegeService from "../services/collegeService.js";
export const accept = async (req, res) => {
    try { const user = await collegeService.acceptInvitation(req.body); return res.status(201).json({ message: "College Admin account created. Please log in.", user }); }
    catch (error) { return res.status(error.statusCode || 500).json({ message: error.message }); }
};
