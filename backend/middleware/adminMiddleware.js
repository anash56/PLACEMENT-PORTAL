export const requireRoles = (...roles) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Authentication required." });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: "You do not have permission to perform this action." });
    return next();
};

export const superAdminOnly = requireRoles("super_admin");

export const collegeAdminOnly = (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Authentication required." });
    if (req.user.role !== "college_admin") return res.status(403).json({ message: "College Admin access required." });
    if (!req.user.college || req.user.collegeStatus !== "approved") return res.status(403).json({ message: "Your college is not approved or active." });
    return next();
};

// Backward-compatible import name, but legacy `admin` users are intentionally not privileged.
const adminOnly = requireRoles("college_admin", "super_admin");
export default adminOnly;
