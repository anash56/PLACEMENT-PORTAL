import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import PageContainer from "../components/ui/PageContainer";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import ApplicationCard from "../components/student/applications/ApplicationCard";

export default function MyApplications() {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [totalApplications, setTotalApplications] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchApplications = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const { data } = await api.get("/applications/my", {
                params: { page, limit: 5 },
            });
            const visibleApplications = (data.applications || []).filter(
                application => application.job,
            );
            setApplications(visibleApplications);
            setTotalApplications(Number(data.totalApplications || 0));
            setTotalPages(Math.max(1, Number(data.totalPages || 1)));
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                "We couldn't load your applications. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    return (
        <PageContainer className="!py-7 sm:!py-10">
            <div className="mx-auto max-w-6xl">
                <header className="relative isolate mb-7 overflow-hidden rounded-[26px] bg-[linear-gradient(115deg,#071b3b_0%,#0b2e61_58%,#1555a5_100%)] px-6 py-7 text-white shadow-[0_18px_50px_rgba(13,54,111,.14)] sm:px-9 sm:py-9">
                    <div className="pointer-events-none absolute inset-0 -z-10 opacity-[.12]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.25) 1px, transparent 1px)", backgroundSize: "44px 44px", maskImage: "linear-gradient(110deg, black, transparent 90%)" }} />
                    <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-blue-200 sm:text-xs">
                        Your placement journey
                    </p>
                    <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div className="max-w-2xl">
                            <h1 className="text-3xl font-extrabold leading-tight tracking-[-.045em] text-white sm:text-4xl">
                                My applications
                            </h1>
                            <p className="mt-2 text-sm leading-6 text-blue-100/90 sm:text-base">
                                Follow each application, see where you stand, and keep your next steps clear.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[.08] px-4 py-3">
                            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-lg font-extrabold text-white" aria-hidden="true">
                                {totalApplications.toLocaleString("en-IN")}
                            </span>
                            <span>
                                <span className="block text-sm font-bold text-white">Applications</span>
                                <span className="mt-0.5 block text-xs text-blue-100/80">Across all pages</span>
                            </span>
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div className="space-y-4" aria-label="Loading applications" aria-busy="true">
                        {[1, 2].map(item => (
                            <Card key={item} className="!rounded-2xl">
                                <div className="animate-pulse space-y-4">
                                    <div className="h-5 w-2/5 rounded bg-slate-100" />
                                    <div className="h-4 w-1/4 rounded bg-slate-100" />
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="h-4 rounded bg-slate-100" />
                                        <div className="h-4 rounded bg-slate-100" />
                                    </div>
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
                ) : applications.length === 0 ? (
                    <Card className="!rounded-2xl">
                        <div className="py-10 text-center">
                            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-[#365e85]" aria-hidden="true">
                                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/></svg>
                            </span>
                            <h2 className="mt-4 text-xl font-extrabold text-slate-900">No applications yet</h2>
                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                When you apply to an eligible opening, its status and progress will appear here.
                            </p>
                            <Button className="mt-5" onClick={() => navigate("/jobs")}>Explore opportunities</Button>
                        </div>
                    </Card>
                ) : (
                    <>
                        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                            <div>
                                <h2 className="text-lg font-extrabold text-slate-900">Your application activity</h2>
                                <p className="mt-1 text-sm text-slate-500">Showing {applications.length} applications on this page · {totalApplications.toLocaleString("en-IN")} total.</p>
                            </div>
                            <Button variant="secondary" onClick={() => navigate("/jobs")}>Find more jobs</Button>
                        </div>
                        <div className="space-y-4">
                            {applications.map(application => (
                                <ApplicationCard key={application._id} application={application} />
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <nav aria-label="Application pages" className="mt-7 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</Button>
                                <span className="px-2 text-sm font-semibold tabular-nums text-slate-600">Page {page} of {totalPages}</span>
                                <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage(value => value + 1)}>Next</Button>
                            </nav>
                        )}
                    </>
                )}
            </div>
        </PageContainer>
    );
}
