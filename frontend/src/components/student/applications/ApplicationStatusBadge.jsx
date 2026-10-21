const STATUS_STYLES = {
    Submitted: "border-blue-200 bg-blue-50 text-blue-800",
    "Under Review": "border-amber-200 bg-amber-50 text-amber-800",
    Pending: "border-amber-200 bg-amber-50 text-amber-800",
    Shortlisted: "border-emerald-200 bg-emerald-50 text-emerald-800",
    Offered: "border-green-200 bg-green-50 text-green-800",
    Rejected: "border-rose-200 bg-rose-50 text-rose-800",
    Withdrawn: "border-slate-200 bg-slate-100 text-slate-700",
    "Test Scheduled": "border-sky-200 bg-sky-50 text-sky-800",
    "Interview Scheduled": "border-indigo-200 bg-indigo-50 text-indigo-800",
};

const STATUS_LABELS = {
    Pending: "Under review",
};

export default function ApplicationStatusBadge({ status }) {
    return (
        <span className={`inline-flex max-w-full items-center rounded-full border px-3 py-1.5 text-xs font-extrabold ${STATUS_STYLES[status] || "border-slate-200 bg-slate-50 text-slate-700"}`}>
            {STATUS_LABELS[status] || status || "Status unavailable"}
        </span>
    );
}
