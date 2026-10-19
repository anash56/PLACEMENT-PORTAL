// Shared eligibility rule used by both the job feed and the application endpoint.
export const meetsJobEligibility = (job, user) => {
    if (job.minCgpa !== undefined && job.minCgpa !== null && Number(job.minCgpa) > 0) {
        if (user.cgpa === undefined || user.cgpa === null || Number(user.cgpa) < Number(job.minCgpa)) return false;
    }
    if (Array.isArray(job.allowedBranches) && job.allowedBranches.length > 0) {
        const studentBranch = String(user.branch || "").trim().toLowerCase();
        if (!job.allowedBranches.some(branch => String(branch).trim().toLowerCase() === studentBranch)) return false;
    }
    return true;
};
