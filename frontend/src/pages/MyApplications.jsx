import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import PageContainer from "../components/ui/PageContainer";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import ApplicationCard from "../components/student/applications/ApplicationCard";

const CATEGORY_FILTERS = [
    { value: "all", label: "All applications" },
    { value: "active", label: "In progress" },
    { value: "selected", label: "Selected" },
    { value: "closed", label: "Closed" },
];

const SORT_OPTIONS = [
    { value: "updated", label: "Recently updated" },
    { value: "applied-newest", label: "Recently applied" },
    { value: "applied-oldest", label: "Oldest application" },
];

const EMPTY_COUNTS = { all: 0, active: 0, selected: 0, closed: 0 };

export default function MyApplications() {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [totalApplications, setTotalApplications] = useState(0);
    const [allApplicationsCount, setAllApplicationsCount] = useState(0);
    const [categoryCounts, setCategoryCounts] = useState(EMPTY_COUNTS);
    const [availableStatuses, setAvailableStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [category, setCategory] = useState("all");
    const [statusFilter, setStatusFilter] = useState("");
    const [search, setSearch] = useState("");
    const [submittedSearch, setSubmittedSearch] = useState("");
    const [sort, setSort] = useState("updated");
    const requestSequence = useRef(0);

    // Debounce search so typing doesn't request the API for every character.
    useEffect(() => {
        const timer = window.setTimeout(() => {
            setPage(1);
            setSubmittedSearch(search.trim());
        }, 300);
        return () => window.clearTimeout(timer);
    }, [search]);

    const fetchApplications = useCallback(async () => {
        const requestId = ++requestSequence.current;
        try {
            setLoading(true);
            setError("");
            const { data } = await api.get("/applications/my", {
                params: {
                    page,
                    limit: 5,
                    category,
                    status: statusFilter || undefined,
                    search: submittedSearch || undefined,
                    sort,
                },
            });
            if (requestId !== requestSequence.current) return;

            setApplications(data.applications || []);
            setTotalApplications(Number(data.totalApplications || 0));
            setAllApplicationsCount(Number(data.allApplicationsCount ?? data.totalApplications ?? 0));
            setCategoryCounts({ ...EMPTY_COUNTS, ...(data.categoryCounts || {}) });
            setAvailableStatuses(Array.isArray(data.availableStatuses) ? data.availableStatuses : []);
            setTotalPages(Math.max(1, Number(data.totalPages || 1)));
        } catch (requestError) {
            if (requestId !== requestSequence.current) return;
            setError(
                requestError.response?.data?.message ||
                "We couldn't load your applications. Please try again.",
            );
        } finally {
            if (requestId === requestSequence.current) setLoading(false);
        }
    }, [page, category, statusFilter, submittedSearch, sort]);

    useEffect(() => {
        fetchApplications();
        return () => { requestSequence.current += 1; };
    }, [fetchApplications]);

    const clearFilters = () => {
        setCategory("all");
        setStatusFilter("");
        setSearch("");
        setSubmittedSearch("");
        setSort("updated");
        setPage(1);
    };

    const hasActiveFilters = category !== "all" || Boolean(statusFilter) || Boolean(submittedSearch) || sort !== "updated";

    return (
        <PageContainer className="!py-7 sm:!py-10">
            <div className="mx-auto max-w-6xl min-w-0">
                <header className="relative isolate mb-7 overflow-hidden rounded-[26px] bg-[linear-gradient(115deg,#071b3b_0%,#0b2e61_58%,#1555a5_100%)] px-6 py-7 text-white shadow-[0_18px_50px_rgba(13,54,111,.14)] sm:px-9 sm:py-9">
                    <div className="pointer-events-none absolute inset-0 -z-10 opacity-[.12]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.25) 1px, transparent 1px)", backgroundSize: "44px 44px", maskImage: "linear-gradient(110deg, black, transparent 90%)" }} />
                    <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-blue-200 sm:text-xs">Your placement journey</p>
                    <div className="mt-3 flex min-w-0 flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div className="min-w-0 max-w-2xl">
                            <h1 className="break-words text-3xl font-extrabold leading-tight tracking-[-.045em] text-white sm:text-4xl">My applications</h1>
                            <p className="mt-2 text-sm leading-6 text-blue-100/90 sm:text-base">Follow each application, see where you stand, and keep your next steps clear.</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/15 bg-white/[.08] px-4 py-3">
                            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-lg font-extrabold text-white" aria-hidden="true">{allApplicationsCount.toLocaleString("en-IN")}</span>
                            <span>
                                <span className="block text-sm font-bold text-white">Applications</span>
                                <span className="mt-0.5 block text-xs text-blue-100/90">All your applications</span>
                            </span>
                        </div>
                    </div>
                </header>

                {!loading && !error && allApplicationsCount > 0 && (
                    <Card className="mb-5 !rounded-2xl !p-4 sm:!p-5">
                        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(190px,.7fr)_minmax(190px,.7fr)]">
                            <div className="min-w-0">
                                <label htmlFor="application-search" className="mb-2 block text-xs font-extrabold uppercase tracking-[.1em] text-slate-700">Search applications</label>
                                <input
                                    id="application-search"
                                    type="search"
                                    value={search}
                                    onChange={event => setSearch(event.target.value)}
                                    placeholder="Job title or company"
                                    maxLength={100}
                                    className="min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                            <div className="min-w-0">
                                <label htmlFor="application-status-filter" className="mb-2 block text-xs font-extrabold uppercase tracking-[.1em] text-slate-700">Current status</label>
                                <select
                                    id="application-status-filter"
                                    value={statusFilter}
                                    onChange={event => { setStatusFilter(event.target.value); setPage(1); }}
                                    className="min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="">All statuses</option>
                                    {availableStatuses.map(status => <option key={status} value={status}>{status}</option>)}
                                </select>
                            </div>
                            <div className="min-w-0">
                                <label htmlFor="application-sort" className="mb-2 block text-xs font-extrabold uppercase tracking-[.1em] text-slate-700">Sort by</label>
                                <select
                                    id="application-sort"
                                    value={sort}
                                    onChange={event => { setSort(event.target.value); setPage(1); }}
                                    className="min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                >
                                    {SORT_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 border-t border-slate-100 pt-4">
                            <div className="flex min-w-0 flex-wrap items-center gap-2" role="group" aria-label="Filter by application category">
                                {CATEGORY_FILTERS.map(filter => {
                                    const selected = category === filter.value;
                                    const count = Number(categoryCounts[filter.value] || 0);
                                    return (
                                        <button
                                            key={filter.value}
                                            type="button"
                                            aria-pressed={selected}
                                            onClick={() => { setCategory(filter.value); setPage(1); }}
                                            className={`inline-flex min-h-10 max-w-full items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${selected ? "border-[#245e9b] bg-blue-50 text-[#174f97] shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/60"}`}
                                        >
                                            <span>{filter.label}</span>
                                            <span className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums ${selected ? "bg-white text-[#174f97]" : "bg-slate-100 text-slate-600"}`}>{count}</span>
                                        </button>
                                    );
                                })}
                                {hasActiveFilters && <button type="button" onClick={clearFilters} className="ml-auto min-h-10 rounded-lg px-3 py-2 text-sm font-bold text-[#245e9b] transition hover:bg-blue-50 hover:text-[#173c63] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">Clear filters</button>}
                            </div>
                        </div>
                    </Card>
                )}

                {loading ? (
                    <div className="space-y-4" aria-label="Loading applications" aria-busy="true">
                        {[1, 2].map(item => (
                            <Card key={item} className="!rounded-2xl">
                                <div className="animate-pulse space-y-4">
                                    <div className="h-5 w-2/5 rounded bg-slate-100" />
                                    <div className="h-4 w-1/4 rounded bg-slate-100" />
                                    <div className="grid gap-3 sm:grid-cols-2"><div className="h-4 rounded bg-slate-100" /><div className="h-4 rounded bg-slate-100" /></div>
                                    <div className="h-16 rounded-xl bg-slate-50" />
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : error ? (
                    <Card className="!rounded-2xl">
                        <div className="py-8 text-center">
                            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-lg font-extrabold text-rose-700" aria-hidden="true">!</span>
                            <h2 className="mt-4 text-lg font-extrabold text-slate-900">Unable to load applications</h2>
                            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">{error}</p>
                            <Button className="mt-5" onClick={fetchApplications}>Try again</Button>
                        </div>
                    </Card>
                ) : allApplicationsCount === 0 ? (
                    <Card className="!rounded-2xl">
                        <div className="py-10 text-center">
                            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-[#365e85]" aria-hidden="true">
                                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/></svg>
                            </span>
                            <h2 className="mt-4 text-xl font-extrabold text-slate-900">No applications yet</h2>
                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">When you apply to an eligible opening, its status and progress will appear here.</p>
                            <Button className="mt-5" onClick={() => navigate("/jobs")}>Explore opportunities</Button>
                        </div>
                    </Card>
                ) : totalApplications === 0 ? (
                    <Card className="!rounded-2xl">
                        <div className="py-10 text-center">
                            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-lg text-[#245e9b]" aria-hidden="true">⌕</span>
                            <h2 className="mt-4 text-xl font-extrabold text-slate-900">No matching applications</h2>
                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">Try a different search or status filter, or clear filters to see all your applications.</p>
                            <Button variant="secondary" className="mt-5" onClick={clearFilters}>Clear filters</Button>
                        </div>
                    </Card>
                ) : (
                    <>
                        <div className="mb-4 flex min-w-0 flex-wrap items-end justify-between gap-3">
                            <div className="min-w-0">
                                <h2 className="text-lg font-extrabold text-slate-900">Your application activity</h2>
                                <p className="mt-1 text-sm leading-6 text-slate-600" aria-live="polite">
                                    Showing {applications.length} on this page · {totalApplications.toLocaleString("en-IN")} matching application{totalApplications === 1 ? "" : "s"}.
                                </p>
                            </div>
                            <Button variant="secondary" onClick={() => navigate("/jobs")}>Find more jobs</Button>
                        </div>
                        <div className="min-w-0 space-y-4">
                            {applications.map(application => <ApplicationCard key={application._id} application={application} />)}
                        </div>
                        {totalPages > 1 && (
                            <nav aria-label="Application pages" className="mt-7 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(value => Math.max(1, value - 1))}>Previous</Button>
                                <span className="px-2 text-sm font-semibold tabular-nums text-slate-600">Page {page} of {totalPages}</span>
                                <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage(value => Math.min(totalPages, value + 1))}>Next</Button>
                            </nav>
                        )}
                    </>
                )}
            </div>
        </PageContainer>
    );
}
