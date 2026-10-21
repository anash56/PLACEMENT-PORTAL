import ApplicationStatusBadge from "./ApplicationStatusBadge";

const FINAL_STATUSES = new Set(["Selected", "Rejected", "Withdrawn", "Offered"]);
const STATUS_LABELS = { Pending: "Pending (existing record)" };

function formatDateTime(value) {
    if (!value) return "Date unavailable";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date unavailable";
    return date.toLocaleString("en-IN", {
        day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit",
    });
}

function ActivityItem({ entry, fallbackDate }) {
    const isRejected = entry.status === "Rejected";
    const isSelected = ["Selected", "Offered"].includes(entry.status);
    const dotStyle = isRejected
        ? "bg-rose-600 ring-rose-100"
        : isSelected ? "bg-emerald-600 ring-emerald-100" : "bg-[#245e9b] ring-blue-100";
    return (
        <li className="relative min-w-0 pb-5 pl-7 last:pb-0">
            <span className={`absolute left-0 top-1.5 h-3 w-3 rounded-full ring-4 ${dotStyle}`} aria-hidden="true" />
            <p className="break-words text-sm font-bold text-slate-800">{STATUS_LABELS[entry.status] || entry.status || "Application update"}</p>
            {entry.note && <p className="mt-1 break-words text-sm leading-6 text-slate-600">{entry.note}</p>}
            <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                {formatDateTime(entry.changedAt || entry.createdAt || fallbackDate)}
                {entry.changedBy?.name ? ` · Updated by ${entry.changedBy.name}` : ""}
            </p>
        </li>
    );
}

/** A single current status, job-specific stages, and an audit history of actual updates. */
export default function ApplicationProgress({ application, status: legacyStatus }) {
    const currentStatus = application?.status || legacyStatus || "Submitted";
    const workflowStages = Array.isArray(application?.workflowStages) ? application.workflowStages : [];
    const history = Array.isArray(application?.statusHistory) ? application.statusHistory : [];
    const hasSubmissionEntry = history.some(entry => entry.status === "Submitted");
    const visitedStages = new Set(history.map(entry => entry.status));
    const reversedHistory = [...history].reverse();
    const hasCustomStages = workflowStages.some(stage => stage !== "Submitted");

    return (
        <section className="mt-5 min-w-0 border-t border-slate-100 pt-5" aria-label="Application activity">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="text-sm font-extrabold text-slate-800">Application activity</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-600">The status and updates recorded by the placement team.</p>
                </div>
                <ApplicationStatusBadge status={currentStatus} />
            </div>

            {hasCustomStages && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <h4 className="text-sm font-extrabold text-slate-800">Workflow for this job</h4>
                    <p className="mt-1 text-xs leading-5 text-slate-600">Only stages recorded in your activity are marked as reached. The company may skip or change stages as needed.</p>
                    <ol className="mt-3 grid gap-2 sm:grid-cols-2">
                        {workflowStages.map((stage, index) => {
                            const isCurrent = stage === currentStatus;
                            const isRecorded = visitedStages.has(stage);
                            return (
                                <li key={`${stage}-${index}`} className={`flex min-w-0 items-start gap-2 rounded-lg border px-3 py-2 ${isCurrent ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white"}`}>
                                    <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-extrabold ${isCurrent ? "bg-[#245e9b] text-white" : isRecorded ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>
                                        {isCurrent ? "•" : isRecorded ? "✓" : index + 1}
                                    </span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block break-words text-xs font-bold text-slate-800">{stage}</span>
                                        <span className={`mt-0.5 block text-[10px] font-semibold ${isCurrent ? "text-[#245e9b]" : isRecorded ? "text-emerald-700" : "text-slate-500"}`}>
                                            {isCurrent ? "Current status" : isRecorded ? "Recorded" : "Not recorded"}
                                        </span>
                                    </span>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            )}

            {hasCustomStages && FINAL_STATUSES.has(currentStatus) && (
                <div className={`mt-4 rounded-xl border px-4 py-3 text-sm font-semibold ${currentStatus === "Rejected" ? "border-rose-200 bg-rose-50 text-rose-800" : currentStatus === "Withdrawn" ? "border-slate-200 bg-slate-50 text-slate-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
                    Final outcome: {STATUS_LABELS[currentStatus] || currentStatus}
                </div>
            )}

            {history.length > 0 ? (
                <ol className="mt-5 border-l border-slate-200 pl-0">
                    {reversedHistory.map((entry, index) => (
                        <ActivityItem
                            key={`status-${entry.changedAt || index}-${index}`}
                            entry={entry}
                            fallbackDate={application?.createdAt}
                        />
                    ))}
                </ol>
            ) : (
                <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3 text-sm leading-6 text-slate-600">
                    No detailed status history is available for this older application yet. New updates will be recorded here.
                </p>
            )}

            {history.length > 0 && !hasSubmissionEntry && (
                <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-3 text-sm leading-6 text-amber-900">
                    This application predates status-history tracking. Entries above show the updates recorded after tracking became available.
                </p>
            )}
        </section>
    );
}
