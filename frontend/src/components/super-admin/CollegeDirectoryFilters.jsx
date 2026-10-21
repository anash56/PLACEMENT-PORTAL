import Card from "../ui/Card";

export default function CollegeDirectoryFilters({ status, onStatusChange, search, onSearchChange, counts, statusOptions }) {
    return (
        <Card className="mb-5 !rounded-2xl !p-4 sm:!p-5">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(220px,.7fr)]">
                <div>
                    <label htmlFor="college-directory-search" className="mb-2 block text-sm font-semibold text-slate-700">Search colleges</label>
                    <input
                        id="college-directory-search"
                        type="search"
                        value={search}
                        onChange={event => onSearchChange(event.target.value)}
                        placeholder="Institution, contact, email, phone or address"
                        className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#7893b2] focus:ring-4 focus:ring-slate-100"
                    />
                </div>
                <div>
                    <label htmlFor="college-directory-status" className="mb-2 block text-sm font-semibold text-slate-700">Filter by status</label>
                    <select
                        id="college-directory-status"
                        value={status}
                        onChange={event => onStatusChange(event.target.value)}
                        className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#7893b2] focus:ring-4 focus:ring-slate-100"
                    >
                        {statusOptions.map(option => <option key={option.value} value={option.value}>{option.label} ({counts[option.value] ?? 0})</option>)}
                    </select>
                </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4" aria-label="College counts by status">
                {statusOptions.filter(option => option.value !== "all").map(option => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onStatusChange(option.value)}
                        aria-pressed={status === option.value}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7893b2] ${status === option.value ? "border-[#b9cbe0] bg-[#edf3f9] text-[#244668]" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                    >
                        {option.label}
                        <span className="rounded-full bg-white/80 px-1.5 py-0.5 tabular-nums">{counts[option.value] ?? 0}</span>
                    </button>
                ))}
            </div>
        </Card>
    );
}
