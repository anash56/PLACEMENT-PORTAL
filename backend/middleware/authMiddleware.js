import jwt from "jsonwebtoken";
import User from "../models/User.js";
import College from "../models/College.js";

const cookieValue = (req, name) => {
    const raw = req.headers.cookie;
    if (!raw) return null;
    for (const part of raw.split(";")) {
        const index = part.indexOf("=");
        if (index < 0) continue;
        if (part.slice(0, index).trim() === name) return decodeURIComponent(part.slice(index + 1).trim());
    }
    return null;
};

const protect = async (req, res, next) => {
    try {
        // Cookie-only: never accept bearer tokens from headers or localStorage.
        const token = cookieValue(req, "token");
        if (!token) return res.status(401).json({ message: "Authentication required." });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password").lean();
        if (!user || user.isSuspended || user.role === "admin") return res.status(401).json({ message: "This account is unavailable. Please contact support." });
        let college = null;
        if (user.college) college = await College.findById(user.college).select("name status admin").lean();
        if (["student", "college_admin"].includes(user.role) && (!college || ["rejected", "suspended"].includes(college.status))) {
            return res.status(403).json({ message: "This college is currently not permitted to use the portal." });
        }
        if (user.role === "college_admin" && college.status !== "approved") {
            return res.status(403).json({ message: "Your college is not approved." });
        }
        req.user = {
            id: String(user._id), role: user.role, college: user.college ? String(user.college) : null,
            collegeName: college?.name || null, collegeStatus: college?.status || null,
            verificationStatus: user.verificationStatus, name: user.name, email: user.email,
            isProfileCompleted: user.isProfileCompleted, resumeUrl: user.resumeUrl,
            cgpa: user.cgpa, branch: user.branch, graduationYear: user.graduationYear
        };
        req.authUser = user;
        req.authCollege = college;
        req.csrfToken = cookieValue(req, "csrf_token");
        return next();
    } catch (error) {
        return res.status(401).json({ message: "Session is invalid or expired. Please log in again." });
    }
};

export default protect;
export { cookieValue };
