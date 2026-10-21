import Card from "../ui/Card";

export default function PlatformMetricCard({ label, value, detail, tone = "default" }) {
    const accent = tone === "attention" ? "border-t-amber-500" : "border-t-[#7893b2]";
    const formatted = value === null || value === undefined || value === "" ? "—" : Number.isFinite(Number(value)) ? Number(value).toLocaleString("en-IN") : "—";

    return (
        <Card className={`h-full !rounded-2xl !border-slate-200 !border-t-[3px] !p-5 !shadow-sm ${accent}`}>
            <p className="text-sm font-semibold text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">{formatted}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
        </Card>
    );
}
