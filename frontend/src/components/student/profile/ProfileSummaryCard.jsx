import Card from "../../ui/Card";

const VERIFICATION_STYLES = {
    verified: "border-emerald-200 bg-emerald-50 text-emerald-800",
    rejected: "border-rose-200 bg-rose-50 text-rose-800",
    pending: "border-amber-200 bg-amber-50 text-amber-800",
};

export default function ProfileSummaryCard({ profile }) {
    const initials = profile.name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "S";
    const status = profile.verificationStatus || "pending";

    return (
        <Card className="!rounded-2xl !p-5 sm:!p-6">
            <div className="text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-slate-200 bg-[linear-gradient(145deg,#f5f8fc,#e8eff7)] text-xl font-extrabold tracking-tight text-[#294e75]">
                    {initials}
                </div>
                <h2 className="mt-4 break-words text-xl font-extrabold tracking-[-.025em] text-slate-900">{profile.name || "Student"}</h2>
                <p className="mt-1 break-all text-sm text-slate-500">{profile.email}</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-extrabold capitalize ${VERIFICATION_STYLES[status] || VERIFICATION_STYLES.pending}`}>
                        Verification: {status}
                    </span>
                    <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-bold ${profile.isProfileCompleted ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-700"}`}>
                        Profile {profile.isProfileCompleted ? "complete" : "incomplete"}
                    </span>
                </div>
            </div>

            <dl className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-sm">
                <div>
                    <dt className="text-xs font-semibold text-slate-500">College</dt>
                    <dd className="mt-1 break-words font-semibold leading-5 text-slate-800">{profile.collegeName || "Not selected"}</dd>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <dt className="text-xs font-semibold text-slate-500">Branch</dt>
                        <dd className="mt-1 break-words font-semibold text-slate-800">{profile.branch || "Not added"}</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-semibold text-slate-500">CGPA</dt>
                        <dd className="mt-1 font-semibold text-slate-800">{profile.cgpa === "" || profile.cgpa === null ? "Not added" : `${profile.cgpa} / 10`}</dd>
                    </div>
                </div>
            </dl>

            <div className="mt-5 border-t border-slate-100 pt-4">
                <h3 className="text-sm font-extrabold text-slate-800">Resume</h3>
                {profile.resumeUrl ? (
                    <a className="mt-2 inline-flex items-center gap-2 text-sm font-bold text-[#365e85] underline decoration-[#b8c9dc] underline-offset-4 hover:text-[#173c63]" href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
                        View uploaded resume <span aria-hidden="true">↗</span>
                    </a>
                ) : (
                    <p className="mt-1 text-sm leading-5 text-slate-500">No resume uploaded yet.</p>
                )}
            </div>
            {profile.verificationRejectionReason && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/70 p-3">
                    <p className="text-xs font-extrabold text-rose-800">Previous rejection reason</p>
                    <p className="mt-1 break-words text-sm leading-5 text-rose-800">{profile.verificationRejectionReason}</p>
                </div>
            )}
        </Card>
    );
}
