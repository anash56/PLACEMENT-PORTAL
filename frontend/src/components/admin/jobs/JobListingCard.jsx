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
        <Card className="!min-w-0 !p-5 sm:!p-6">
            <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h2 className="break-words text-xl font-extrabold text-slate-900">{job.title || "Untitled role"}</h2>
                            <p className="mt-1 break-words text-sm font-semibold text-[#365e85]">{job.company || "Company not set"}</p>
                        </div>
                        <span className={`inline-flex max-w-full shrink-0 items-center rounded-full border px-3 py-1 text-xs font-bold ${deadlinePassed ? "border-amber-200 bg-amber-50 text-amber-800" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                            {deadlinePassed ? "Deadline passed" : deadline ? `Closes ${formatDate(job.deadline)}` : "No deadline"}
                        </span>
                    </div>

                    <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <Info label="Location" value={job.location || "Not specified"} />
                        <Info label="Annual salary" value={formatSalary(job.salary)} />
                        <Info label="Minimum CGPA" value={Number(job.minCgpa || 0) > 0 ? `${job.minCgpa} / 10` : "No minimum"} />
                    </div>

                    {job.description && (
                        <p className="mt-4 line-clamp-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{job.description}</p>
                    )}
                    <div className="mt-4 flex min-w-0 flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-600">Eligible branches:</span>
                        {branches.length ? branches.slice(0, 6).map(branch => (
                            <span key={branch} className="max-w-full break-words rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">{branch}</span>
                        )) : <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">All branches</span>}
                        {branches.length > 6 && <span className="text-xs text-slate-500">+{branches.length - 6} more</span>}
                    </div>
                    <p className="mt-4 text-xs text-slate-500">Posted {job.createdAt ? formatDate(job.createdAt) : "date unavailable"}</p>
                </div>

                <div className="portal-admin-job-actions grid w-full min-w-0 shrink-0 grid-cols-1 gap-2 sm:grid-cols-3 lg:w-40 lg:grid-cols-1">
                    <Button variant="primary" onClick={() => onViewApplicants(job._id)} className="admin-job-action admin-job-action-primary w-full">View applicants</Button>
                    <Button variant="secondary" onClick={() => onEdit(job._id)} className="admin-job-action w-full">Edit job</Button>
                    {/* Use a distinct destructive style for deletion; the confirmation dialog remains in place. */}
                    <Button variant="danger" onClick={() => onDelete(job)} className="admin-job-action w-full">Delete job</Button>
                </div>
            </div>
        </Card>
    );
}

function Info({ label, value }) {
    return (
        <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5">
            <p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-600">{label}</p>
            <p className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</p>
        </div>
    );
}
