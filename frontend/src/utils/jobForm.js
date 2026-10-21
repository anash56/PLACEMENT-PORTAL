export const EMPTY_JOB_FORM = {
    title: "",
    company: "",
    location: "",
    salary: "",
    description: "",
    minCgpa: "",
    allowedBranchesText: "",
    deadline: "",
};

export function jobToForm(job = {}) {
    let deadline = "";
    if (job.deadline) {
        const date = new Date(job.deadline);
        if (!Number.isNaN(date.getTime())) deadline = date.toISOString().slice(0, 10);
    }

    return {
        title: job.title ?? "",
        company: job.company ?? "",
        location: job.location ?? "",
        salary: job.salary ?? "",
        description: job.description ?? "",
        minCgpa: job.minCgpa ?? "",
        allowedBranchesText: Array.isArray(job.allowedBranches) ? job.allowedBranches.join(", ") : "",
        deadline,
    };
}

export function validateJobForm(form) {
    if (!form.title.trim() || !form.company.trim() || !form.location.trim() || !form.description.trim()) {
        return "Enter a job title, company, location, and description.";
    }

    const salary = Number(form.salary);
    if (form.salary === "" || !Number.isFinite(salary) || salary < 0) {
        return "Salary must be a valid non-negative number.";
    }

    if (form.minCgpa !== "") {
        const minCgpa = Number(form.minCgpa);
        if (!Number.isFinite(minCgpa) || minCgpa < 0 || minCgpa > 10) {
            return "Minimum CGPA must be between 0 and 10.";
        }
    }

    return "";
}

export function jobFormToPayload(form) {
    const allowedBranches = [...new Set(
        form.allowedBranchesText
            .split(",")
            .map(branch => branch.trim())
            .filter(Boolean)
            .map(branch => branch.slice(0, 80))
    )];

    return {
        title: form.title.trim(),
        company: form.company.trim(),
        location: form.location.trim(),
        salary: Number(form.salary),
        description: form.description.trim(),
        minCgpa: form.minCgpa === "" ? 0 : Number(form.minCgpa),
        allowedBranches,
        deadline: form.deadline || null,
    };
}
