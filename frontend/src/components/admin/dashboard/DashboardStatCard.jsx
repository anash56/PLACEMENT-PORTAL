import Card from "../../ui/Card";

export default function DashboardStatCard({ label, value, description, tone = "blue", actionLabel, onAction }) {
    const accent = tone === "success" ? "border-t-emerald-500" : "border-t-blue-500";

    return (
        <Card className={`h-full !rounded-2xl !border-slate-200/90 !border-t-[3px] !p-5 !shadow-sm ${accent}`}>
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-3 break-words text-3xl font-extrabold tracking-tight text-slate-900">
                {value}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
            {actionLabel && onAction && (
                <button
                    type="button"
                    onClick={onAction}
                    className="mt-4 inline-flex min-h-8 items-center gap-1 text-xs font-bold text-blue-700 transition hover:text-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                    {actionLabel}
                    <span aria-hidden="true">→</span>
                </button>
            )}
        </Card>
    );
}
