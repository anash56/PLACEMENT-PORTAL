const STATUS_STYLES = {
    Submitted: "border-blue-200 bg-blue-50 text-blue-800",
    Selected: "border-emerald-200 bg-emerald-50 text-emerald-800",
    Offered: "border-emerald-200 bg-emerald-50 text-emerald-800",
    Rejected: "border-rose-200 bg-rose-50 text-rose-800",
    Withdrawn: "border-slate-200 bg-slate-100 text-slate-700",
    Pending: "border-amber-200 bg-amber-50 text-amber-800",
};
const STATUS_LABELS = { Pending: "Pending (existing record)" };

export default function ApplicationStatusBadge({ status }) {
    return (
        <span className={`inline-flex max-w-full items-center rounded-full border px-3 py-1.5 text-xs font-extrabold ${STATUS_STYLES[status] || "border-blue-100 bg-blue-50 text-[#245e9b]"}`}>
            {STATUS_LABELS[status] || status || "Status unavailable"}
        </span>
    );
}
