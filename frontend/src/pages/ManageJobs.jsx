import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import PageContainer from "../components/ui/PageContainer";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import AdminPageHeader from "../components/admin/AdminPageHeader";
import JobListingCard from "../components/admin/jobs/JobListingCard";

const PAGE_SIZE = 10;

export default function ManageJobs() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [submittedSearch, setSubmittedSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedJob, setSelectedJob] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const fetchJobs = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const { data } = await api.get("/jobs", {
                params: { keyword: submittedSearch, page, limit: PAGE_SIZE },
            });
            setJobs(Array.isArray(data.jobs) ? data.jobs : []);
            setTotalPages(Math.max(1, Number(data.totalPages) || 1));
        } catch (requestError) {
            const message = requestError.response?.data?.message || "Could not load job postings.";
            setError(message);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    }, [page, submittedSearch]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleSearch = event => {
        event.preventDefault();
        const nextSearch = search.trim();
        if (page !== 1) setPage(1);
        if (nextSearch === submittedSearch && page === 1) fetchJobs();
        else setSubmittedSearch(nextSearch);
    };

    const clearSearch = () => {
        setSearch("");
        setSubmittedSearch("");
        setPage(1);
    };

    const confirmDeleteJob = async () => {
        if (!selectedJob?._id) return;
        try {
            setDeleteLoading(true);
            await api.delete(`/jobs/${selectedJob._id}`);
            toast.success("Job posting deleted.");
            const deletingLastItemOnPage = jobs.length === 1 && page > 1;
            setSelectedJob(null);
            if (deletingLastItemOnPage) setPage(currentPage => currentPage - 1);
            else await fetchJobs();
        } catch (requestError) {
            toast.error(requestError.response?.data?.message || "Could not delete this job.");
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <PageContainer>
            <AdminPageHeader
                title="Manage jobs"
                description="Keep your college's opportunities accurate, review applicants, and manage deadlines."
                actions={
                    <>
                        <Button onClick={() => navigate("/admin/jobs/create")}>Create job</Button>
                        <Button variant="secondary" onClick={fetchJobs} disabled={loading}>Refresh</Button>
                    </>
                }
            />

            <Card className="mb-6 !p-4 sm:!p-5">
                <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="min-w-0 flex-1">
                        <Input
                            label="Search job postings"
                            type="search"
                            value={search}
                            onChange={event => setSearch(event.target.value)}
                            placeholder="Search by job title, company, or description"
                            maxLength={100}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={loading}>Search</Button>
                        {(search || submittedSearch) && (
                            <Button type="button" variant="secondary" onClick={clearSearch} disabled={loading}>Clear</Button>
                        )}
                    </div>
                </form>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                    <p className="text-xs font-medium text-slate-500">
                        {loading ? "Loading job postings…" : `${jobs.length} job${jobs.length === 1 ? "" : "s"} on this page`}
                        {submittedSearch ? ` matching “${submittedSearch}”` : ""}
                    </p>
                    {!loading && !error && jobs.length > 0 && <p className="text-xs text-slate-500">Page {page} of {totalPages}</p>}
                </div>
            </Card>

            {loading ? (
                <div className="space-y-4" aria-busy="true" aria-label="Loading jobs">
                    {[1, 2, 3].map(item => (
                        <Card key={item} className="!p-5">
                            <div className="animate-pulse space-y-4">
                                <div className="h-5 w-2/5 rounded bg-slate-100" />
                                <div className="h-4 w-1/4 rounded bg-slate-100" />
                                <div className="grid gap-3 sm:grid-cols-3"><div className="h-16 rounded-xl bg-slate-50" /><div className="h-16 rounded-xl bg-slate-50" /><div className="h-16 rounded-xl bg-slate-50" /></div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : error ? (
                <Card className="!p-6 sm:!p-8">
                    <div className="mx-auto max-w-lg py-4 text-center">
                        <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-amber-200 bg-amber-50 text-lg font-extrabold text-amber-800" aria-hidden="true">!</div>
                        <h2 className="mt-4 text-lg font-extrabold text-slate-900">Unable to load jobs</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{error}</p>
                        <Button className="mt-5" onClick={fetchJobs}>Try again</Button>
                    </div>
                </Card>
            ) : jobs.length === 0 ? (
                <Card className="!p-6 sm:!p-10">
                    <div className="mx-auto max-w-lg py-5 text-center">
                        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-xl text-[#365e85]" aria-hidden="true">⌕</div>
                        <h2 className="mt-4 text-lg font-extrabold text-slate-900">{submittedSearch ? "No matching jobs" : "No job postings yet"}</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            {submittedSearch ? "Try another keyword or clear the search to see all your college's postings." : "Create your first opportunity to start connecting eligible students with employers."}
                        </p>
                        <div className="mt-5 flex flex-wrap justify-center gap-2">
                            {submittedSearch && <Button variant="secondary" onClick={clearSearch}>Clear search</Button>}
                            <Button onClick={() => navigate("/admin/jobs/create")}>Create job</Button>
                        </div>
                    </div>
                </Card>
            ) : (
                <>
                    <div className="space-y-4">
                        {jobs.map(job => (
                            <JobListingCard
                                key={job._id}
                                job={job}
                                onViewApplicants={jobId => navigate(`/admin/jobs/${jobId}/applicants`)}
                                onEdit={jobId => navigate(`/admin/jobs/${jobId}/edit`)}
                                onDelete={setSelectedJob}
                            />
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <nav className="mt-7 flex flex-wrap items-center justify-center gap-3" aria-label="Job listing pages">
                            <Button variant="secondary" disabled={page <= 1 || loading} onClick={() => setPage(currentPage => currentPage - 1)}>Previous</Button>
                            <span className="min-w-24 text-center text-sm font-semibold text-slate-600">Page {page} of {totalPages}</span>
                            <Button variant="secondary" disabled={page >= totalPages || loading} onClick={() => setPage(currentPage => currentPage + 1)}>Next</Button>
                        </nav>
                    )}
                </>
            )}

            <ConfirmationModal
                open={Boolean(selectedJob)}
                title="Delete job posting?"
                message={selectedJob ? `“${selectedJob.title}” will be removed. Applications linked to this job are also deleted, and this action cannot be undone.` : "This action cannot be undone."}
                loading={deleteLoading}
                confirmText="Delete job"
                onCancel={() => { if (!deleteLoading) setSelectedJob(null); }}
                onConfirm={confirmDeleteJob}
            />
        </PageContainer>
    );
}
