import Card from "../../ui/Card";
import Button from "../../ui/Button";

export default function CollegeVerificationCard({ profile, idCardName, resubmitting, onFileChange, onSubmit }) {
    const rejected = profile.verificationStatus === "rejected";

    return (
        <Card className="!rounded-2xl !p-5 sm:!p-6">
            <div className="flex items-start gap-3">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${rejected ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-800"}`} aria-hidden="true">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 20 6v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6l8-3Z"/><path d="M12 8v4m0 4h.01"/></svg>
                </span>
                <div className="min-w-0 flex-1">
                    <h2 className="text-base font-extrabold text-slate-900">College ID verification</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                        {rejected
                            ? "Your ID needs another review. Upload a corrected card to resubmit your request."
                            : "Your college affiliation is awaiting review. You may replace the submitted card if a correction is needed."}
                    </p>
                </div>
            </div>
            {rejected && profile.verificationRejectionReason && (
                <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/70 p-3">
                    <p className="text-xs font-extrabold text-rose-800">Reason provided by your College Admin</p>
                    <p className="mt-1 break-words text-sm leading-5 text-rose-800">{profile.verificationRejectionReason}</p>
                </div>
            )}
            <form onSubmit={onSubmit} className="mt-5 space-y-3">
                <p className="text-sm font-bold text-slate-700">{rejected ? "Corrected college ID card" : "Replacement college ID card (optional)"}</p>
                <label htmlFor="student-profile-id-card" className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-3 transition hover:border-[#9db2ca] hover:bg-slate-50">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-[#365e85]" aria-hidden="true">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg>
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block break-words text-sm font-bold text-slate-800">{idCardName || "Choose ID card file"}</span>
                        <span className="mt-1 block text-xs text-slate-500">JPG, PNG, or PDF · maximum 5 MB</span>
                    </span>
                    <input id="student-profile-id-card" type="file" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" onChange={onFileChange} className="sr-only" />
                </label>
                <Button type="submit" variant="secondary" disabled={resubmitting || !idCardName} className="w-full">
                    {resubmitting ? "Submitting ID card…" : rejected ? "Resubmit for verification" : "Replace submitted ID card"}
                </Button>
            </form>
        </Card>
    );
}
