import Card from "../../ui/Card";

const STATUS_COLORS = {
    Offered: "bg-emerald-500",
    Shortlisted: "bg-emerald-500",
    Rejected: "bg-rose-500",
};

const formatCurrency = value => `₹${Number(value || 0).toLocaleString("en-IN")}`;

function RecruitmentPipeline({ totalApplications, statusBreakdown }) {
    const entries = Object.entries(statusBreakdown || {});

    return (
        <Card className="!rounded-2xl">
            <h3 className="mb-5 border-b border-slate-100 pb-3 text-lg font-bold text-slate-900">
                Recruitment pipeline
            </h3>
            {entries.length > 0 ? (
                <div className="space-y-4">
                    {entries.map(([status, rawCount]) => {
                        const count = Number(rawCount || 0);
                        const percentage = totalApplications > 0
                            ? Math.min(100, (count / totalApplications) * 100)
                            : 0;
                        const barColor = STATUS_COLORS[status] || "bg-[#7893b2]";

                        return (
                            <div key={status}>
                                <div className="mb-1.5 flex justify-between gap-3 text-sm">
                                    <span className="font-semibold text-slate-600">{status}</span>
                                    <span className="font-bold tabular-nums text-slate-900">
                                        {count.toLocaleString("en-IN")} ({Math.round(percentage)}%)
                                    </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                    <div
                                        className={`h-2 rounded-full transition-[width] duration-500 ${barColor}`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                    {totalApplications === 0 && (
                        <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
                            Application status analytics will appear after students apply to a job.
                        </p>
                    )}
                </div>
            ) : (
                <p className="py-4 text-sm text-slate-500">No application status data is available.</p>
            )}
        </Card>
    );
}

function BranchDistribution({ branches }) {
    const orderedBranches = [...(branches || [])]
        .sort((a, b) => Number(b.value || 0) - Number(a.value || 0));

    return (
        <Card className="!rounded-2xl">
            <h3 className="mb-5 border-b border-slate-100 pb-3 text-lg font-bold text-slate-900">
                Branch distribution
            </h3>
            {orderedBranches.length > 0 ? (
                <div className="max-h-56 space-y-3 overflow-y-auto">
                    {orderedBranches.map(branch => (
                        <div key={branch.name} className="flex items-center justify-between gap-3 text-sm">
                            <span className="min-w-0 truncate font-medium text-slate-600">{branch.name}</span>
                            <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                                {Number(branch.value || 0).toLocaleString("en-IN")} student{Number(branch.value) === 1 ? "" : "s"}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="py-5 text-center text-sm text-slate-500">
                    Branch statistics will appear when student profiles are available.
                </p>
            )}
        </Card>
    );
}

function SalaryStatistics({ totalJobs, offeredApplications, salaryStats, placedSalaryStats }) {
    const groups = [
        {
            title: "Posted jobs",
            description: "Listed salaries",
            available: totalJobs > 0,
            tone: "blue",
            values: [
                ["Average", salaryStats?.averageSalary],
                ["Maximum", salaryStats?.maxSalary],
                ["Minimum", salaryStats?.minSalary],
            ],
        },
        {
            title: "Placed students",
            description: "Applications marked Offered",
            available: offeredApplications > 0,
            tone: "green",
            values: [
                ["Average", placedSalaryStats?.averagePlacedSalary],
                ["Maximum", placedSalaryStats?.maxPlacedSalary],
                ["Minimum", placedSalaryStats?.minPlacedSalary],
            ],
        },
    ];

    return (
        <Card className="!rounded-2xl">
            <h3 className="mb-5 border-b border-slate-100 pb-3 text-lg font-bold text-slate-900">
                Salary statistics
            </h3>
            <div className="space-y-5">
                {groups.map(group => (
                    <div key={group.title}>
                        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                            <h4 className={`text-sm font-bold ${group.tone === "green" ? "text-emerald-800" : "text-slate-800"}`}>
                                {group.title}
                            </h4>
                            <span className="text-xs text-slate-500">{group.description}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            {group.values.map(([label, value]) => (
                                <div
                                    key={label}
                                    className={`rounded-xl border p-3 text-center ${group.tone === "green" ? "border-emerald-100 bg-emerald-50/60" : "border-slate-100 bg-slate-50"}`}
                                >
                                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
                                    <p className={`mt-1 break-words text-sm font-extrabold ${group.tone === "green" ? "text-emerald-800" : "text-slate-800"}`}>
                                        {group.available ? formatCurrency(value) : "—"}
                                    </p>
                                </div>
                            ))}
                        </div>
                        {!group.available && (
                            <p className="mt-2 text-xs leading-5 text-slate-500">
                                {group.tone === "green" ? "No offers recorded yet." : "No job salary data available yet."}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </Card>
    );
}

export default function PlacementAnalytics({
    totalApplications,
    totalJobs,
    statusBreakdown,
    branchBreakdown,
    salaryStats,
    placedSalaryStats,
    offeredApplications,
}) {
    return (
        <section className="mt-8" aria-labelledby="placement-analytics-heading">
            <div className="mb-4">
                <h2 id="placement-analytics-heading" className="text-xl font-extrabold text-slate-900">
                    Placement analytics
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                    Application progress, student distribution, and salary outcomes.
                </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <RecruitmentPipeline totalApplications={totalApplications} statusBreakdown={statusBreakdown} />
                <div className="space-y-6">
                    <BranchDistribution branches={branchBreakdown} />
                    <SalaryStatistics
                        totalJobs={totalJobs}
                        offeredApplications={offeredApplications}
                        salaryStats={salaryStats}
                        placedSalaryStats={placedSalaryStats}
                    />
                </div>
            </div>
        </section>
    );
}
