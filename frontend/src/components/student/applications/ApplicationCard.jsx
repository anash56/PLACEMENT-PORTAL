import Card from "../../ui/Card";
import ApplicationStatusBadge from "./ApplicationStatusBadge";
import ApplicationProgress from "./ApplicationProgress";

const formatDate = value => {
    if (!value) return "Date unavailable";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "Date unavailable"
        : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const formatSalary = value => {
    if (value === null || value === undefined || value === "" || !Number.isFinite(Number(value))) return "Not specified";
    return `₹${Number(value).toLocaleString("en-IN")}`;
};

export default function ApplicationCard({ application }) {
    const job = application.job || {};
    const deadline = job.deadline ? new Date(job.deadline) : null;
    const validDeadline = deadline && !Number.isNaN(deadline.getTime());

    return (
        <Card className="!min-w-0 !rounded-2xl !p-5 sm:!p-6">
            <article className="min-w-0">
                <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                        <h2 className="break-words text-xl font-extrabold leading-snug tracking-[-.025em] text-slate-900 sm:text-2xl">
                            {job.title || "Job posting unavailable"}
                        </h2>
                        <p className="mt-1.5 break-words text-sm font-bold text-[#365e85]">{job.company || "Company unavailable"}</p>
                        {job.college?.name && <p className="mt-1 break-words text-xs text-slate-600">Posted for {job.college.name}</p>}
                        <dl className="mt-4 grid min-w-0 gap-3 text-sm sm:grid-cols-2">
                            <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5">
                                <dt className="text-xs font-semibold text-slate-600">Location</dt>
                                <dd className="mt-1 break-words font-semibold text-slate-800">{job.location || "Not specified"}</dd>
                            </div>
                            <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5">
                                <dt className="text-xs font-semibold text-slate-600">Listed salary</dt>
                                <dd className="mt-1 break-words font-semibold text-slate-800">{formatSalary(job.salary)}</dd>
                            </div>
                            {validDeadline && <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5">
                                <dt className="text-xs font-semibold text-slate-600">Application deadline</dt>
                                <dd className="mt-1 break-words font-semibold text-slate-800">{formatDate(deadline)}</dd>
                            </div>}
                            <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5">
                                <dt className="text-xs font-semibold text-slate-600">Applied on</dt>
                                <dd className="mt-1 break-words font-semibold text-slate-800">{formatDate(application.createdAt)}</dd>
                            </div>
                        </dl>
                        {job.description && <p className="mt-4 break-words whitespace-pre-wrap text-sm leading-6 text-slate-600">{job.description}</p>}
                    </div>
                    <aside className="flex min-w-0 flex-row items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:w-44 sm:shrink-0 sm:flex-col sm:items-start sm:justify-start sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                        <span className="text-xs font-semibold text-slate-600">Current status</span>
                        <ApplicationStatusBadge status={application.status} />
                    </aside>
                </div>
                <ApplicationProgress application={application} />
            </article>
        </Card>
    );
}
