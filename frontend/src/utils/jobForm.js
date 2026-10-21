export const EMPTY_JOB_FORM = {
    title: "",
    company: "",
    location: "",
    salary: "",
    description: "",
    minCgpa: "",
    allowedBranchesText: "",
    selectionStagesText: "",
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
        selectionStagesText: Array.isArray(job.selectionStages) ? job.selectionStages.join("\n") : "",
        deadline,
    };
}

function parseCommaSeparatedUnique(value, maxLength = 80) {
    return [...new Set(String(value || "")
        .split(",")
        .map(item => item.trim())
        .filter(Boolean)
        .map(item => item.slice(0, maxLength)) )];
}

export function parseSelectionStages(value) {
    return [...new Set(String(value || "")
        .split(/[\n,]/)
        .map(stage => stage.trim())
        .filter(Boolean)
        .map(stage => stage.slice(0, 80))
        .filter((stage, index, all) => all.findIndex(item => item.toLocaleLowerCase() === stage.toLocaleLowerCase()) === index))];
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

    const stages = String(form.selectionStagesText || "").split(/[\n,]/).map(stage => stage.trim()).filter(Boolean);
    if (stages.length > 12) return "Add no more than 12 selection stages.";
    if (stages.some(stage => stage.length > 80)) return "Each selection stage must be 80 characters or fewer.";
    const uniqueStages = new Set(stages.map(stage => stage.toLocaleLowerCase()));
    if (uniqueStages.size !== stages.length) return "Remove duplicate selection stages. Each stage should appear once.";

    return "";
}

export function jobFormToPayload(form) {
    return {
        title: form.title.trim(),
        company: form.company.trim(),
        location: form.location.trim(),
        salary: Number(form.salary),
        description: form.description.trim(),
        minCgpa: form.minCgpa === "" ? 0 : Number(form.minCgpa),
        allowedBranches: parseCommaSeparatedUnique(form.allowedBranchesText),
        selectionStages: parseSelectionStages(form.selectionStagesText),
        deadline: form.deadline || null,
    };
}
