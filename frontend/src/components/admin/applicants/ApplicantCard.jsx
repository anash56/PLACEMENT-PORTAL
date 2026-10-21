import Card from "../../ui/Card";

export const APPLICATION_STATUSES = [
    "Pending",
    "Test Scheduled",
    "Interview Scheduled",
    "Shortlisted",
    "Offered",
    "Rejected",
];

const STATUS_STYLES = {
    Pending: "border-amber-200 bg-amber-50 text-amber-800",
    "Test Scheduled": "border-slate-200 bg-slate-100 text-slate-700",
    "Interview Scheduled": "border-sky-200 bg-sky-50 text-sky-800",
    Shortlisted: "border-emerald-200 bg-emerald-50 text-emerald-800",
    Offered: "border-green-200 bg-green-50 text-green-800",
    Rejected: "border-rose-200 bg-rose-50 text-rose-800",
};

function formatDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function ApplicantCard({ application, updating, onStatusChange }) {
    const student = application.student || {};
    const status = APPLICATION_STATUSES.includes(application.status) ? application.status : "Pending";
    const statusClass = STATUS_STYLES[status] || STATUS_STYLES.Pending;

    return (
        <Card className="!p-5 sm:!p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start gap-3">
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-extrabold text-[#365e85]" aria-hidden="true">
                            {String(student.name || "?").trim().split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join("").toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="break-words text-lg font-extrabold text-slate-900">{student.name || "Unknown student"}</h2>
                            <p className="mt-0.5 break-words text-sm text-slate-500">{student.email || "Email unavailable"}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-extrabold ${statusClass}`}>{status}</span>
                                {student.verificationStatus && (
                                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${student.verificationStatus === "verified" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
                                        {student.verificationStatus === "verified" ? "College verified" : `Verification: ${student.verificationStatus}`}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <Info label="Branch" value={student.branch || "Not specified"} />
                        <Info label="CGPA" value={student.cgpa !== undefined && student.cgpa !== null ? `${student.cgpa} / 10` : "Not specified"} />
                        <Info label="Graduation year" value={student.graduationYear || "Not specified"} />
                        {student.contactNumber && <Info label="Contact" value={student.contactNumber} />}
                        <Info label="Applied on" value={formatDate(application.createdAt)} />
                    </div>

                    {Array.isArray(student.skills) && student.skills.length > 0 && (
                        <div className="mt-4">
                            <p className="mb-2 text-xs font-extrabold uppercase tracking-[.12em] text-slate-500">Skills</p>
                            <div className="flex flex-wrap gap-1.5">
                                {student.skills.map((skill, index) => (
                                    <span key={`${skill}-${index}`} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">{skill}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-4">
                        {student.resumeUrl ? (
                            <a href={student.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#365e85] transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500">
                                <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0-3-3m3 3 3-3m2 8H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414A1 1 0 0 1 19 6.707V19a2 2 0 0 1-2 2Z" /></svg>
                                View resume
                                <span aria-hidden="true">↗</span>
                            </a>
                        ) : (
                            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">No resume uploaded</span>
                        )}
                    </div>
                </div>

                <div className="w-full rounded-xl border border-slate-100 bg-slate-50/70 p-4 lg:w-56">
                    <label htmlFor={`status-${application._id}`} className="mb-2 block text-xs font-extrabold uppercase tracking-[.1em] text-slate-600">Application status</label>
                    <select
                        id={`status-${application._id}`}
                        value={status}
                        disabled={updating}
                        onChange={event => onStatusChange(application._id, event.target.value)}
                        className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-wait disabled:opacity-60"
                    >
                        {APPLICATION_STATUSES.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                    <p className="mt-2 text-xs leading-5 text-slate-500">{updating ? "Saving status…" : "Changes are saved immediately."}</p>
                </div>
            </div>
        </Card>
    );
}

function Info({ label, value }) {
    return (
        <div className="rounded-lg border border-slate-100 bg-white px-3 py-2">
            <p className="text-[10px] font-extrabold uppercase tracking-[.1em] text-slate-500">{label}</p>
            <p className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</p>
        </div>
    );
}
