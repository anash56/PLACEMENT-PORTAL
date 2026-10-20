import Card from "../../ui/Card";
import Button from "../../ui/Button";

function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date unavailable";
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function isoDateTime(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function AttentionCard({ title, description, count, countLabel, buttonLabel, onClick, tone = "blue", children }) {
    const countStyle = tone === "amber"
        ? "bg-amber-50 text-amber-800"
        : tone === "green"
            ? "bg-emerald-50 text-emerald-800"
            : "bg-slate-100 text-slate-700";

    return (
        <Card className="flex h-full flex-col !rounded-2xl !p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-base font-bold text-slate-900">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
                </div>
                {typeof count === "number" && (
                    <span className={`shrink-0 rounded-xl px-3 py-2 text-sm font-extrabold tabular-nums ${countStyle}`}>
                        {count.toLocaleString("en-IN")}
                    </span>
                )}
            </div>
            {countLabel && <p className="mt-3 text-xs leading-5 text-slate-500">{countLabel}</p>}
            {children}
            <div className="mt-auto pt-5">
                <Button variant="secondary" className="w-full" onClick={onClick}>{buttonLabel}</Button>
            </div>
        </Card>
    );
}

export default function NeedsAttentionPanel({
    pendingApplications = 0,
    pendingStudentVerifications = 0,
    upcomingDeadlineCount = 0,
    upcomingDeadlines = [],
    onReviewJobs,
    onVerifyStudents,
}) {
    const nearestDeadlines = upcomingDeadlines.slice(0, 3);

    return (
        <section className="mt-8" aria-labelledby="needs-attention-heading">
            <div className="mb-4">
                <h2 id="needs-attention-heading" className="text-xl font-extrabold text-slate-900">Needs attention</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Review pending work and stay ahead of upcoming application deadlines.
                </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
                <AttentionCard
                    title="Applications awaiting review"
                    description="Open a job to review its applicants and update their application status."
                    count={pendingApplications}
                    countLabel={pendingApplications === 0
                        ? "No applications are currently marked Pending."
                        : `${pendingApplications.toLocaleString("en-IN")} pending application${pendingApplications === 1 ? "" : "s"}`}
                    buttonLabel="Review applicants"
                    onClick={onReviewJobs}
                />
                <AttentionCard
                    title="Student ID verification"
                    description="Review student affiliation documents before students apply to placements."
                    count={pendingStudentVerifications}
                    countLabel={pendingStudentVerifications === 0
                        ? "No student ID verifications are currently pending."
                        : `${pendingStudentVerifications.toLocaleString("en-IN")} student verification${pendingStudentVerifications === 1 ? "" : "s"} pending`}
                    buttonLabel="Open verification queue"
                    onClick={onVerifyStudents}
                    tone="amber"
                />
                <AttentionCard
                    title="Upcoming job deadlines"
                    description="Jobs with a deadline in the next seven days."
                    count={upcomingDeadlineCount}
                    countLabel={upcomingDeadlineCount === 0
                        ? "No upcoming deadlines were found for the next seven days."
                        : `${upcomingDeadlineCount.toLocaleString("en-IN")} job deadline${upcomingDeadlineCount === 1 ? "" : "s"} approaching`}
                    buttonLabel="Manage jobs"
                    onClick={onReviewJobs}
                    tone="green"
                >
                    {nearestDeadlines.length > 0 && (
                        <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                            {nearestDeadlines.map(job => (
                                <li key={job._id} className="flex items-start justify-between gap-3 text-xs">
                                    <span className="min-w-0 font-semibold leading-5 text-slate-700">{job.title}</span>
                                    <time dateTime={isoDateTime(job.deadline)} className="shrink-0 text-slate-500">
                                        {formatDate(job.deadline)}
                                    </time>
                                </li>
                            ))}
                        </ul>
                    )}
                </AttentionCard>
            </div>
        </section>
    );
}
