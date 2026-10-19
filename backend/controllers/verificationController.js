import * as idCardService from "../services/idCardService.js";
const sendError = (res, error) => res.status(error.statusCode || 500).json({ message: error.message || "Request failed." });
export const queue = async (req, res) => { try { return res.json({ students: await idCardService.getVerificationQueue(req.user.college) }); } catch (e) { return sendError(res, e); } };
export const approve = async (req, res) => { try { return res.json({ student: await idCardService.decideStudentVerification({ studentId: req.params.studentId, collegeId: req.user.college, action: "approve" }) }); } catch (e) { return sendError(res, e); } };
export const reject = async (req, res) => { try { return res.json({ student: await idCardService.decideStudentVerification({ studentId: req.params.studentId, collegeId: req.user.college, action: "reject", reason: req.body.reason }) }); } catch (e) { return sendError(res, e); } };
export const idCard = async (req, res) => { try { return res.json(await idCardService.getStudentIdCardUrl({ studentId: req.params.studentId, collegeId: req.user.college })); } catch (e) { return sendError(res, e); } };
export const resubmit = async (req, res) => { try { return res.json({ message: "ID card resubmitted. Verification is pending.", ...(await idCardService.resubmitStudentIdCard(req.user.id, req.body.collegeIdCardBase64)) }); } catch (e) { return sendError(res, e); } };
