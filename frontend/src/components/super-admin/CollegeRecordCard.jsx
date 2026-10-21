import Card from "../ui/Card";
import Button from "../ui/Button";
import Textarea from "../ui/TextArea";

const STATUS_STYLE = {
    pending: "bg-amber-50 text-amber-800 ring-amber-200",
    approved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    rejected: "bg-rose-50 text-rose-800 ring-rose-200",
    suspended: "bg-slate-100 text-slate-700 ring-slate-200",
};

const dateLabel = value => {
    if (!value) return "Date unavailable";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export default function CollegeRecordCard({ college, reason, onReasonChange, onAction, busyAction }) {
    const needsReason = ["pending", "approved", "rejected", "suspended"].includes(college.status);
    const reasonLabel = college.status === "pending"
        ? "Review note (optional; required to reject)"
        : college.status === "approved"
            ? "Reason (required to suspend)"
            : "Review note (optional)";

    return (
        <Card className="!rounded-2xl !border-slate-200 !p-5 !shadow-sm sm:!p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="break-words text-xl font-extrabold tracking-tight text-slate-900">{college.name}</h3>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide ring-1 ${STATUS_STYLE[college.status] || STATUS_STYLE.pending}`}>{college.status || "unknown"}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-700">{college.contactPerson}{college.contactDesignation ? ` · ${college.contactDesignation}` : ""}</p>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500"><a className="break-all hover:text-[#245e9b]" href={`mailto:${college.contactEmail}`}>{college.contactEmail}</a>{college.contactPhone && <a href={`tel:${college.contactPhone}`} className="hover:text-[#245e9b]">{college.contactPhone}</a>}</div>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{college.address}</p>
                    {college.website && <a className="mt-2 inline-block break-all text-sm font-semibold text-[#245e9b] underline decoration-slate-300 underline-offset-4 hover:text-[#173c63]" target="_blank" rel="noreferrer" href={college.website}>{college.website}</a>}
                    <p className="mt-3 text-xs text-slate-400">Request submitted {dateLabel(college.createdAt)}</p>
                    {college.admin && <div className="mt-3 inline-flex max-w-full flex-wrap items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-xs text-emerald-900"><span className="font-extrabold">Assigned admin</span><span className="break-all">{college.admin.name} · {college.admin.email}</span></div>}
                    {college.rejectionReason && <p className="mt-3 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm leading-5 text-rose-800"><strong>Rejection reason:</strong> {college.rejectionReason}</p>}
                    {college.reviewReason && <p className="mt-3 text-xs leading-5 text-slate-500"><strong>Latest review note:</strong> {college.reviewReason}</p>}
                </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
                {needsReason && <Textarea label={reasonLabel} rows={2} value={reason} onChange={event => onReasonChange(event.target.value)} placeholder="Add context for the audit trail" />}
                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                    {college.status === "pending" && <>
                        <Button disabled={Boolean(busyAction)} onClick={() => onAction("approve")}>{busyAction === "approve" ? "Approving…" : "Approve & invite admin"}</Button>
                        <Button variant="danger" disabled={Boolean(busyAction)} onClick={() => onAction("reject")}>{busyAction === "reject" ? "Rejecting…" : "Reject request"}</Button>
                    </>}
                    {college.status === "approved" && <>
                        <Button variant="secondary" disabled={Boolean(busyAction)} onClick={() => onAction("invite")}>{busyAction === "invite" ? "Sending…" : "Send admin invitation"}</Button>
                        <Button variant="danger" disabled={Boolean(busyAction)} onClick={() => onAction("suspend")}>{busyAction === "suspend" ? "Suspending…" : "Suspend college"}</Button>
                    </>}
                    {college.status === "suspended" && <Button disabled={Boolean(busyAction)} onClick={() => onAction("restore")}>{busyAction === "restore" ? "Restoring…" : "Restore college access"}</Button>}
                    {college.status === "rejected" && <>
                        <Button disabled={Boolean(busyAction)} onClick={() => onAction("approve")}>{busyAction === "approve" ? "Approving…" : "Reconsider & approve"}</Button>
                        <p className="text-xs leading-5 text-slate-400">Approval uses the existing invitation workflow.</p>
                    </>}
                </div>
            </div>
        </Card>
    );
}
