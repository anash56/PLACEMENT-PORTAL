import Card from "../../ui/Card";
import Button from "../../ui/Button";

const formatDate = value => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date unavailable";
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const STATUS_CLASS = {
    Pending: "bg-amber-50 text-amber-800",
    "Test Scheduled": "bg-blue-50 text-blue-800",
    "Interview Scheduled": "bg-indigo-50 text-indigo-800",
    Shortlisted: "bg-emerald-50 text-emerald-800",
    Offered: "bg-green-50 text-green-800",
    Rejected: "bg-rose-50 text-rose-800",
};

export default function RecentActivity({ jobs = [], applications = [], onManageJobs, onEditJob, onViewApplicants }) {
    return (
        <section className="mt-8" aria-labelledby="recent-activity-heading">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <div>
                    <h2 id="recent-activity-heading" className="text-xl font-extrabold text-slate-900">Recent activity</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        The latest job postings and student applications in your college workspace.
                    </p>
                </div>
                <Button variant="secondary" onClick={onManageJobs}>Manage all jobs</Button>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="!rounded-2xl">
                    <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <h3 className="text-lg font-bold text-slate-900">Recent job postings</h3>
                        <span className="text-xs font-semibold text-slate-500">Latest 4</span>
                    </div>
                    {jobs.length > 0 ? (
                        <ul className="divide-y divide-slate-100">
                            {jobs.slice(0, 4).map(job => (
                                <li key={job._id} className="flex items-start justify-between gap-3 py-4 first:pt-0 last:pb-0">
                                    <div className="min-w-0">
                                        <p className="break-words text-sm font-bold text-slate-900">{job.title}</p>
                                        <p className="mt-1 text-xs text-slate-500">{job.company}{job.location ? ` · ${job.location}` : ""}</p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Posted {formatDate(job.createdAt)}
                                            {job.deadline ? ` · Deadline ${formatDate(job.deadline)}` : " · No deadline set"}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onEditJob(job._id)}
                                        className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-50 hover:text-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                    >
                                        Edit
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="py-7 text-center">
                            <p className="text-sm font-semibold text-slate-700">No job postings yet</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">Create a job to start sharing opportunities with eligible students.</p>
                            <Button className="mt-4" onClick={onManageJobs}>Open job management</Button>
                        </div>
                    )}
                </Card>

                <Card className="!rounded-2xl">
                    <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <h3 className="text-lg font-bold text-slate-900">Recent applications</h3>
                        <span className="text-xs font-semibold text-slate-500">Latest 6</span>
                    </div>
                    {applications.length > 0 ? (
                        <ul className="divide-y divide-slate-100">
                            {applications.slice(0, 6).map(application => {
                                const student = application.student || {};
                                const job = application.job || {};
                                const statusClass = STATUS_CLASS[application.status] || "bg-slate-100 text-slate-700";

                                return (
                                    <li key={application._id} className="py-4 first:pt-0 last:pb-0">
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="break-words text-sm font-bold text-slate-900">{student.name || "Student account unavailable"}</p>
                                                <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                                                    {job.title || "Job posting unavailable"}{job.company ? ` · ${job.company}` : ""}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">Applied {formatDate(application.createdAt)}</p>
                                            </div>
                                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${statusClass}`}>
                                                {application.status || "Unknown"}
                                            </span>
                                        </div>
                                        {job._id && (
                                            <button
                                                type="button"
                                                onClick={() => onViewApplicants(job._id)}
                                                className="mt-2 text-xs font-bold text-blue-700 transition hover:text-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                            >
                                                View applicants for this job →
                                            </button>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <div className="py-7 text-center">
                            <p className="text-sm font-semibold text-slate-700">No applications yet</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">Applications will appear here after students apply to your job postings.</p>
                        </div>
                    )}
                </Card>
            </div>
        </section>
    );
}
