import ApplicationStatusBadge from "./ApplicationStatusBadge";

const STATUS_LABELS = {
    Pending: "Under review",
};

function formatDateTime(value) {
    if (!value) return "Date unavailable";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date unavailable";
    return date.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function ActivityItem({ title, note, changedBy, date, tone = "blue" }) {
    const dotStyle = tone === "green" ? "bg-emerald-600 ring-emerald-100" : tone === "red" ? "bg-rose-600 ring-rose-100" : "bg-[#245e9b] ring-blue-100";
    return (
        <li className="relative min-w-0 pl-7 pb-5 last:pb-0">
            <span className={`absolute left-0 top-1.5 h-3 w-3 rounded-full ring-4 ${dotStyle}`} aria-hidden="true" />
            <p className="break-words text-sm font-bold text-slate-800">{title}</p>
            {note && <p className="mt-1 break-words text-sm leading-6 text-slate-600">{note}</p>}
            <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                {formatDateTime(date)}{changedBy?.name ? ` · Updated by ${changedBy.name}` : ""}
            </p>
        </li>
    );
}

/** Displays only status updates and selection steps that have actually been recorded. */
export default function ApplicationProgress({ application, status: legacyStatus }) {
    const currentStatus = application?.status || legacyStatus || "Submitted";
    const hasRecordedStatusHistory = Array.isArray(application?.statusHistory) && application.statusHistory.length > 0;
    const statusHistory = hasRecordedStatusHistory ? [...application.statusHistory].reverse() : [];
    const hasSubmissionEntry = statusHistory.some(entry => entry.status === "Submitted");
    const stageHistory = Array.isArray(application?.stageHistory) ? [...application.stageHistory].reverse() : [];
    const currentStage = application?.currentStage || "";
    const statusTitle = item => STATUS_LABELS[item.status] || item.status || "Application update";

    return (
        <section className="mt-5 border-t border-slate-100 pt-5" aria-label="Application activity">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="text-sm font-extrabold text-slate-800">Application activity</h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">Submission and updates recorded in the portal.</p>
                </div>
                <ApplicationStatusBadge status={currentStatus} />
            </div>

            {hasRecordedStatusHistory && !hasSubmissionEntry && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-3 text-sm leading-6 text-amber-900">Earlier application activity was not tracked. Entries below show updates recorded from the point history tracking became available.</p>}

            {hasRecordedStatusHistory ? <ol className="mt-5 border-l border-slate-200 pl-0">
                {statusHistory.map((entry, index) => (
                    <ActivityItem
                        key={`status-${entry.changedAt || index}-${index}`}
                        title={statusTitle(entry)}
                        note={entry.note || ""}
                        changedBy={entry.changedBy}
                        date={entry.changedAt || entry.createdAt || application?.createdAt}
                        tone={entry.status === "Rejected" ? "red" : entry.status === "Offered" ? "green" : "blue"}
                    />
                ))}
            </ol> : <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3 text-sm leading-6 text-slate-600">No detailed status history is available for this older application yet. New updates will be recorded here.</p>}

            {(currentStage || stageHistory.length > 0) && (
                <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                            <h4 className="text-sm font-extrabold text-[#173e70]">Hiring stage</h4>
                            <p className="mt-1 text-sm leading-6 text-slate-700">{currentStage || "No active stage assigned"}</p>
                        </div>
                        <span className="rounded-full border border-blue-100 bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#245e9b]">Job-specific</span>
                    </div>
                    {stageHistory.length > 0 && (
                        <ol className="mt-4 space-y-3 border-t border-blue-100 pt-3">
                            {stageHistory.map((entry, index) => (
                                <li key={`stage-${entry.changedAt || index}-${index}`} className="min-w-0">
                                    <p className="break-words text-sm font-bold text-slate-800">{entry.stage}</p>
                                    {entry.note && <p className="mt-0.5 break-words text-sm leading-5 text-slate-600">{entry.note}</p>}
                                    <p className="mt-1 text-xs leading-5 text-slate-500">{formatDateTime(entry.changedAt)}{entry.changedBy?.name ? ` · Updated by ${entry.changedBy.name}` : ""}</p>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            )}
        </section>
    );
}
