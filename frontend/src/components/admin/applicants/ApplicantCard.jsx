
import { useState } from "react";
import Card from "../../ui/Card";
import ConfirmationModal from "../../ui/ConfirmationModal";

const FINAL_OUTCOME_STATUSES = ["Selected", "Rejected", "Withdrawn"];

const LEGACY_STATUSES = ["Pending", "Test Scheduled", "Interview Scheduled", "Shortlisted", "Offered"];

const STATUS_STYLES = {
    Submitted: "border-blue-200 bg-blue-50 text-blue-800",
    Selected: "border-emerald-200 bg-emerald-50 text-emerald-800",
    Offered: "border-emerald-200 bg-emerald-50 text-emerald-800",
    Rejected: "border-rose-200 bg-rose-50 text-rose-800",
    Withdrawn: "border-slate-200 bg-slate-100 text-slate-700",
    Pending: "border-amber-200 bg-amber-50 text-amber-800",
};

const STATUS_LABELS = { Pending: "Pending (existing record)" };

function formatDate(value) {
    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? "Date unavailable"
        : date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
}

export default function ApplicantCard({ application, job, updating, onStatusChange }) {
    const student = application.student || {};
    const status = application.status || "Submitted";

    const snapshot = Array.isArray(application.workflowStages)
        ? application.workflowStages
        : [];

    const jobStages = Array.isArray(job?.selectionStages)
        ? job.selectionStages
        : Array.isArray(application.job?.selectionStages)
            ? application.job.selectionStages
            : [];

    const chosenStages = snapshot.length
        ? snapshot
        : ["Submitted", ...jobStages];

    const workflowStages = [...new Set(chosenStages.filter(Boolean))];

    const options = [...workflowStages, ...FINAL_OUTCOME_STATUSES];

    if (LEGACY_STATUSES.includes(status) && !options.includes(status)) {
        options.push(status);
    }

    const statusOptions = [...new Set(options)];

    const [pendingStatus, setPendingStatus] = useState(null);
    const [changeNote, setChangeNote] = useState("");
    const [confirming, setConfirming] = useState(false);

    const requestStatusChange = nextStatus => {
        if (nextStatus !== status) {
            setPendingStatus({
                value: nextStatus,
                current: status,
            });
        }
    };

    const confirmStatusChange = async () => {
        if (!pendingStatus || confirming || updating) return;

        setConfirming(true);

        try {
            const updated = await onStatusChange(application._id, {
                status: pendingStatus.value,
                note: changeNote.trim(),
            });

            if (updated !== false) {
                setPendingStatus(null);
                setChangeNote("");
            }
        } finally {
            setConfirming(false);
        }
    };

    const lastStatusUpdate =
        Array.isArray(application.statusHistory) && application.statusHistory.length
            ? application.statusHistory[application.statusHistory.length - 1]
            : null;

    const isRejection = pendingStatus?.value === "Rejected";

    return (
        <>
            <Card className="!min-w-0 !p-5 sm:!p-6">
                <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 flex-wrap items-start gap-3">
                            <div
                                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-sm font-extrabold text-[#365e85]"
                                aria-hidden="true"
                            >
                                {String(student.name || "?")
                                    .trim()
                                    .split(/\s+/)
                                    .slice(0, 2)
                                    .map(part => part.charAt(0))
                                    .join("")
                                    .toUpperCase() || "?"}
                            </div>

                            <div className="min-w-0 flex-1">
                                <h2 className="break-words text-lg font-extrabold text-slate-900">
                                    {student.name || "Unknown student"}
                                </h2>

                                <p className="mt-0.5 break-words text-sm text-slate-600">
                                    {student.email || "Email unavailable"}
                                </p>

                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <span
                                        className={`inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${STATUS_STYLES[status] ||
                                            "border-blue-100 bg-blue-50 text-[#245e9b]"
                                            }`}
                                    >
                                        {STATUS_LABELS[status] || status}
                                    </span>

                                    {student.verificationStatus && (
                                        <span
                                            className={`inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${student.verificationStatus === "verified"
                                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                                    : "border-slate-200 bg-slate-50 text-slate-700"
                                                }`}
                                        >
                                            {student.verificationStatus === "verified"
                                                ? "College verified"
                                                : `Verification: ${student.verificationStatus}`}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            <Info label="Branch" value={student.branch || "Not specified"} />

                            <Info
                                label="CGPA"
                                value={
                                    student.cgpa !== undefined && student.cgpa !== null
                                        ? `${student.cgpa} / 10`
                                        : "Not specified"
                                }
                            />

                            <Info
                                label="Graduation year"
                                value={student.graduationYear || "Not specified"}
                            />

                            {student.contactNumber && (
                                <Info label="Contact" value={student.contactNumber} />
                            )}

                            <Info label="Applied on" value={formatDate(application.createdAt)} />
                        </div>

                        {Array.isArray(student.skills) && student.skills.length > 0 && (
                            <div className="mt-4">
                                <p className="mb-2 text-xs font-extrabold uppercase tracking-[.12em] text-slate-600">
                                    Skills on profile
                                </p>

                                <div className="flex flex-wrap gap-1.5">
                                    {student.skills.map((skill, index) => (
                                        <span
                                            key={`${skill}-${index}`}
                                            className="max-w-full break-words rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-4">
                            {student.resumeUrl ? (
                                <a
                                    href={student.resumeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#365e85] transition hover:border-blue-200 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                >
                                    View resume <span aria-hidden="true">↗</span>
                                </a>
                            ) : (
                                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                                    No resume uploaded
                                </span>
                            )}
                        </div>

                        {lastStatusUpdate && (
                            <p className="mt-4 break-words rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
                                Latest update: {STATUS_LABELS[lastStatusUpdate.status] || lastStatusUpdate.status}
                                {lastStatusUpdate.note ? ` — ${lastStatusUpdate.note}` : ""}
                            </p>
                        )}
                    </div>

                    <div className="grid w-full min-w-0 gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 lg:w-72 lg:shrink-0">
                        <div className="min-w-0">
                            <label
                                htmlFor={`status-${application._id}`}
                                className="mb-2 block text-xs font-extrabold uppercase tracking-[.1em] text-slate-700"
                            >
                                Current workflow status
                            </label>

                            <select
                                id={`status-${application._id}`}
                                value={status}
                                disabled={updating || confirming}
                                onChange={event => requestStatusChange(event.target.value)}
                                className="min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-wait disabled:opacity-60"
                            >
                                {statusOptions.map(option => (
                                    <option key={option} value={option}>
                                        {STATUS_LABELS[option] || option}
                                    </option>
                                ))}
                            </select>

                            <p className="mt-2 text-xs leading-5 text-slate-600">
                                One status represents the applicant's current stage or final outcome for this job.
                            </p>
                        </div>

                        <p className="text-xs leading-5 text-slate-600">
                            {updating || confirming
                                ? "Saving update…"
                                : "Confirm each change. Add a note if the student needs context."}
                        </p>
                    </div>
                </div>
            </Card>

            <ConfirmationModal
                open={Boolean(pendingStatus)}
                title={isRejection ? "Record rejection?" : "Update application status?"}
                message={
                    pendingStatus
                        ? `Change ${student.name || "this candidate"}'s status from "${pendingStatus.current}" to "${pendingStatus.value}"? This becomes the single current status visible to the student.`
                        : "Confirm this application update."
                }
                confirmText={isRejection ? "Confirm rejection" : "Update status"}
                confirmVariant={isRejection ? "danger" : "primary"}
                loading={confirming || updating}
                onCancel={() => {
                    if (!confirming && !updating) {
                        setPendingStatus(null);
                        setChangeNote("");
                    }
                }}
                onConfirm={confirmStatusChange}
            >
                <div className="mt-4 min-w-0">
                    <label
                        htmlFor={`update-note-${application._id}`}
                        className="mb-2 block text-xs font-extrabold uppercase tracking-[.1em] text-slate-700"
                    >
                        Update note{" "}
                        <span className="font-semibold normal-case text-slate-500">
                            (optional)
                        </span>
                    </label>

                    <textarea
                        id={`update-note-${application._id}`}
                        rows={3}
                        maxLength={500}
                        value={changeNote}
                        onChange={event => setChangeNote(event.target.value)}
                        disabled={confirming || updating}
                        placeholder="Share useful context or the next step. This note will be visible to the student."
                        className="w-full min-w-0 resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm leading-5 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                    />

                    <p className="mt-1 text-right text-[11px] tabular-nums text-slate-500">
                        {changeNote.length}/500
                    </p>
                </div>
            </ConfirmationModal>
        </>
    );
}

function Info({ label, value }) {
    return (
        <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2">
            <p className="text-[10px] font-extrabold uppercase tracking-[.1em] text-slate-600">
                {label}
            </p>
            <p className="mt-1 break-words text-sm font-semibold text-slate-800">
                {value}
            </p>
        </div>
    );
}
