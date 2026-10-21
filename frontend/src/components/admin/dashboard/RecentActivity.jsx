import Card from "../../ui/Card";
import Button from "../../ui/Button";

const formatDate = value => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date unavailable";
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const STATUS_CLASS = {
    Submitted: "border-blue-100 bg-blue-50 text-blue-800",
    Selected: "border-emerald-100 bg-emerald-50 text-emerald-800",
    Offered: "border-emerald-100 bg-emerald-50 text-emerald-800",
    Rejected: "border-rose-100 bg-rose-50 text-rose-800",
    Withdrawn: "border-slate-200 bg-slate-100 text-slate-700",
};

export default function RecentActivity({ jobs = [], applications = [], onManageJobs, onEditJob, onViewApplicants }) {
    return (
        <section className="mt-8" aria-labelledby="recent-activity-heading">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <div>
                    <h2 id="recent-activity-heading" className="text-xl font-extrabold text-slate-900">Recent activity</h2>
                    <p className="mt-1 text-sm text-slate-600">The latest job postings and student applications in your college workspace.</p>
                </div>
                <Button variant="secondary" onClick={onManageJobs}>Manage all jobs</Button>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="!rounded-2xl">
                    <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <h3 className="text-lg font-bold text-slate-900">Recent job postings</h3>
                        <span className="text-xs font-semibold text-slate-600">Latest 2</span>
                    </div>
                    {jobs.length > 0 ? (
                        <ul className="divide-y divide-slate-100">
                            {jobs.slice(0, 2).map(job => (
                                <li key={job._id} className="flex items-start justify-between gap-3 py-4 first:pt-0 last:pb-0">
                                    <div className="min-w-0">
                                        <p className="break-words text-sm font-bold text-slate-900">{job.title}</p>
                                        <p className="mt-1 break-words text-xs text-slate-600">{job.company}{job.location ? ` · ${job.location}` : ""}</p>
                                        <p className="mt-1 text-xs text-slate-600">Posted {formatDate(job.createdAt)}{job.deadline ? ` · Deadline ${formatDate(job.deadline)}` : " · No deadline set"}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onEditJob(job._id)}
                                        className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#245e9b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                    >
                                        Edit
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="py-7 text-center">
                            <p className="text-sm font-semibold text-slate-800">No job postings yet</p>
                            <p className="mt-1 text-xs leading-5 text-slate-600">Create a job to start sharing opportunities with eligible students.</p>
                            <Button className="mt-4" onClick={onManageJobs}>Open job management</Button>
                        </div>
                    )}
                </Card>

                <Card className="!rounded-2xl">
                    <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <h3 className="text-lg font-bold text-slate-900">Recent applications</h3>
                        <span className="text-xs font-semibold text-slate-600">Latest 2</span>
                    </div>
                    {applications.length > 0 ? (
                        <ul className="divide-y divide-slate-100">
                            {applications.slice(0, 2).map(application => {
                                const student = application.student || {};
                                const job = application.job || {};
                                const statusClass = STATUS_CLASS[application.status] || "border-blue-100 bg-blue-50 text-[#245e9b]";
                                return (
                                    <li key={application._id} className="py-4 first:pt-0 last:pb-0">
                                        <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="break-words text-sm font-bold text-slate-900">{student.name || "Student account unavailable"}</p>
                                                <p className="mt-1 break-words text-xs leading-5 text-slate-600">{job.title || "Job posting unavailable"}{job.company ? ` · ${job.company}` : ""}</p>
                                                <p className="mt-1 text-xs text-slate-600">Applied {formatDate(application.createdAt)}</p>
                                            </div>
                                            <span className={`inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${statusClass}`}>
                                                {application.status || "Status unavailable"}
                                            </span>
                                        </div>
                                        {job._id && (
                                            <button type="button" onClick={() => onViewApplicants(job._id)} className="mt-2 text-xs font-bold text-blue-700 transition hover:text-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                                                View applicants for this job →
                                            </button>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="py-7 text-center">
                            <p className="text-sm font-semibold text-slate-800">No applications yet</p>
                            <p className="mt-1 text-xs leading-5 text-slate-600">Applications will appear here after students apply to your job postings.</p>
                        </div>
                    )}
                </Card>
            </div>
        </section>
    );
}
