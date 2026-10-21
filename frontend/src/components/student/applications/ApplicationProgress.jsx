const STEPS = [
    { label: "Applied", status: "Pending" },
    { label: "Test", status: "Test Scheduled" },
    { label: "Interview", status: "Interview Scheduled" },
    { label: "Shortlisted", status: "Shortlisted" },
    { label: "Offer", status: "Offered" },
];

const STATUS_INDEX = {
    Pending: 0,
    "Test Scheduled": 1,
    "Interview Scheduled": 2,
    Shortlisted: 3,
    Offered: 4,
};

export default function ApplicationProgress({ status }) {
    if (status === "Rejected") {
        return (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-sm text-rose-900" role="status">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white font-extrabold text-rose-700 ring-1 ring-rose-200" aria-hidden="true">!</span>
                <div>
                    <p className="font-extrabold">Application update</p>
                    <p className="mt-1 leading-6 text-rose-800">This application has been marked as rejected. You can continue exploring other eligible opportunities.</p>
                </div>
            </div>
        );
    }

    const activeIndex = Math.max(0, STATUS_INDEX[status] ?? 0);

    return (
        <section className="mt-5 border-t border-slate-100 pt-5" aria-label="Application progress">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-extrabold text-slate-800">Application progress</h3>
                <p className="text-xs font-semibold text-[#365e85]">Current stage: {STEPS[activeIndex].label}</p>
            </div>
            <ol className="grid grid-cols-5 gap-1 sm:gap-3">
                {STEPS.map((step, index) => {
                    const completed = index < activeIndex;
                    const active = index === activeIndex;
                    return (
                        <li key={step.status} className="min-w-0 text-center">
                            <div className="flex items-center">
                                {index > 0 && <span className={`h-0.5 flex-1 ${index <= activeIndex ? "bg-[#7896b7]" : "bg-slate-200"}`} aria-hidden="true" />}
                                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[10px] font-extrabold sm:h-8 sm:w-8 sm:text-xs ${completed ? "border-[#365e85] bg-[#365e85] text-white" : active ? "border-[#365e85] bg-white text-[#365e85] ring-4 ring-[#365e85]/10" : "border-slate-200 bg-white text-slate-400"}`} aria-current={active ? "step" : undefined}>
                                    {completed ? "✓" : index + 1}
                                </span>
                                {index < STEPS.length - 1 && <span className={`h-0.5 flex-1 ${index < activeIndex ? "bg-[#7896b7]" : "bg-slate-200"}`} aria-hidden="true" />}
                            </div>
                            <span className={`mt-2 block break-words text-[9px] font-bold leading-4 sm:text-[11px] ${active ? "text-[#294e75]" : completed ? "text-slate-600" : "text-slate-400"}`}>
                                {step.label}
                            </span>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}
