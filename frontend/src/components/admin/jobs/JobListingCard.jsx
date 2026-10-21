import Card from "../../ui/Card";
import Button from "../../ui/Button";

function formatSalary(value) {
    const amount = Number(value);
    return Number.isFinite(amount) ? `₹${amount.toLocaleString("en-IN")}` : "Not specified";
}

function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function JobListingCard({ job, onViewApplicants, onEdit, onDelete }) {
    const deadline = job.deadline ? new Date(job.deadline) : null;
    const deadlinePassed = deadline && !Number.isNaN(deadline.getTime()) && deadline < new Date(new Date().setHours(0, 0, 0, 0));
    const branches = Array.isArray(job.allowedBranches) ? job.allowedBranches.filter(Boolean) : [];

    return (
        <Card className="!p-5 sm:!p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h2 className="break-words text-xl font-extrabold text-slate-900">{job.title || "Untitled role"}</h2>
                            <p className="mt-1 text-sm font-semibold text-[#365e85]">{job.company || "Company not set"}</p>
                        </div>
                        <span className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-bold ${deadlinePassed ? "border-amber-200 bg-amber-50 text-amber-800" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                            {deadlinePassed ? "Deadline passed" : deadline ? `Closes ${formatDate(job.deadline)}` : "No deadline"}
                        </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
                            <p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-500">Location</p>
                            <p className="mt-1 break-words text-sm font-semibold text-slate-800">{job.location || "Not specified"}</p>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
                            <p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-500">Annual salary</p>
                            <p className="mt-1 break-words text-sm font-semibold text-slate-800">{formatSalary(job.salary)}</p>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
                            <p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-500">Minimum CGPA</p>
                            <p className="mt-1 text-sm font-semibold text-slate-800">{Number(job.minCgpa || 0) > 0 ? `${job.minCgpa} / 10` : "No minimum"}</p>
                        </div>
                    </div>

                    {job.description && (
                        <p className="mt-4 line-clamp-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{job.description}</p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-600">Eligible branches:</span>
                        {branches.length ? branches.slice(0, 6).map(branch => (
                            <span key={branch} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600">{branch}</span>
                        )) : <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">All branches</span>}
                        {branches.length > 6 && <span className="text-xs text-slate-500">+{branches.length - 6} more</span>}
                    </div>
                    <p className="mt-4 text-xs text-slate-500">Posted {job.createdAt ? formatDate(job.createdAt) : "date unavailable"}</p>
                </div>

                <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-3 lg:w-40 lg:grid-cols-1">
                    <Button variant="secondary" onClick={() => onViewApplicants(job._id)} className="w-full">View applicants</Button>
                    <Button variant="secondary" onClick={() => onEdit(job._id)} className="w-full">Edit job</Button>
                    <Button variant="danger" onClick={() => onDelete(job)} className="w-full">Delete job</Button>
                </div>
            </div>
        </Card>
    );
}
