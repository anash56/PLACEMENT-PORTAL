import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import PageContainer from "../components/ui/PageContainer";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import AdminPageHeader from "../components/admin/AdminPageHeader";
import ApplicantCard, { APPLICATION_STATUSES } from "../components/admin/applicants/ApplicantCard";

const STATUS_OPTIONS = ["All statuses", ...APPLICATION_STATUSES];

function csvCell(value) {
    let text = String(value ?? "");
    // Prevent spreadsheet programs from evaluating untrusted cells as formulas.
    if (/^[\s\u0000-\u001f]*[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
}

function countApplications(applicants, status) {
    return applicants.filter(application => application.status === status).length;
}

function MetricCard({ label, value, description, tone = "slate" }) {
    const valueClass = tone === "green" ? "text-emerald-800" : tone === "amber" ? "text-amber-800" : "text-slate-900";
    return (
        <Card className="!p-4 sm:!p-5">
            <p className="text-xs font-bold text-slate-500">{label}</p>
            <p className={`mt-2 text-2xl font-extrabold tracking-tight ${valueClass}`}>{value.toLocaleString("en-IN")}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </Card>
    );
}

export default function Applicants() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [applicants, setApplicants] = useState([]);
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingApplicationId, setUpdatingApplicationId] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All statuses");

    const fetchApplicants = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const [applicationsResponse, jobResponse] = await Promise.all([
                api.get(`/applications/job/${jobId}`),
                api.get(`/jobs/${jobId}`),
            ]);
            const applicationData = applicationsResponse.data;
            setApplicants(Array.isArray(applicationData) ? applicationData : Array.isArray(applicationData.applications) ? applicationData.applications : []);
            setJob(jobResponse.data.job || jobResponse.data || null);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not load the applicants for this job.");
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    useEffect(() => {
        fetchApplicants();
    }, [fetchApplicants]);

    const visibleApplicants = useMemo(() => {
        const normalizedQuery = search.trim().toLocaleLowerCase();
        return applicants.filter(application => {
            const student = application.student || {};
            const matchesStatus = statusFilter === "All statuses" || application.status === statusFilter;
            const searchableText = [student.name, student.email, student.branch, student.graduationYear, ...(Array.isArray(student.skills) ? student.skills : [])]
                .filter(Boolean)
                .join(" ")
                .toLocaleLowerCase();
            return matchesStatus && (!normalizedQuery || searchableText.includes(normalizedQuery));
        });
    }, [applicants, search, statusFilter]);

    const updateStatus = async (applicationId, status) => {
        const currentApplication = applicants.find(application => application._id === applicationId);
        if (!currentApplication || currentApplication.status === status) return;

        try {
            setUpdatingApplicationId(applicationId);
            await api.patch(`/applications/${applicationId}`, { status });
            setApplicants(current => current.map(application => application._id === applicationId ? { ...application, status } : application));
            toast.success("Application status updated.");
        } catch (requestError) {
            toast.error(requestError.response?.data?.message || "Could not update the application status.");
        } finally {
            setUpdatingApplicationId(null);
        }
    };

    const exportVisibleApplicants = () => {
        if (visibleApplicants.length === 0) {
            toast.error("There are no visible applicants to export.");
            return;
        }

        const headers = ["Student Name", "Student Email", "Branch", "CGPA", "Graduation Year", "Contact Number", "Skills", "Application Status", "Applied Date"];
        const rows = visibleApplicants.map(application => {
            const student = application.student || {};
            const date = new Date(application.createdAt);
            const appliedDate = application.createdAt && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : "";
            return [
                student.name || "Unknown Student",
                student.email || "",
                student.branch || "Unspecified",
                student.cgpa ?? "",
                student.graduationYear || "",
                student.contactNumber || "",
                Array.isArray(student.skills) ? student.skills.join("; ") : "",
                application.status || "Unknown",
                appliedDate,
            ];
        });

        const csv = "\uFEFF" + [headers, ...rows].map(row => row.map(csvCell).join(",")).join("\r\n");
        const objectUrl = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = `applicants-${jobId}-${new Date().toISOString().slice(0, 10)}.csv`;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        toast.success(`Exported ${visibleApplicants.length} applicant${visibleApplicants.length === 1 ? "" : "s"}.`);
    };

    const pendingCount = countApplications(applicants, "Pending");
    const shortlistedCount = countApplications(applicants, "Shortlisted");
    const offeredCount = countApplications(applicants, "Offered");
    const filterIsActive = search.trim() || statusFilter !== "All statuses";

    return (
        <PageContainer>
            <AdminPageHeader
                title="Applicants"
                description={job?.title ? `Review candidates for ${job.title}${job.company ? ` at ${job.company}` : ""}.` : "Review candidate profiles and keep application statuses up to date."}
                actions={
                    <>
                        <Button onClick={exportVisibleApplicants} disabled={loading || visibleApplicants.length === 0}>Export CSV</Button>
                        <Button variant="secondary" onClick={() => navigate("/admin/jobs")}>Back to jobs</Button>
                    </>
                }
            />

            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true" aria-label="Loading applicant summary">
                    {[1, 2, 3, 4].map(item => <Card key={item} className="!p-5"><div className="animate-pulse space-y-3"><div className="h-3 w-2/5 rounded bg-slate-100" /><div className="h-7 w-1/3 rounded bg-slate-100" /><div className="h-3 w-3/4 rounded bg-slate-50" /></div></Card>)}
                </div>
            ) : error ? (
                <Card className="!p-6 sm:!p-8">
                    <div className="mx-auto max-w-lg py-4 text-center">
                        <h2 className="text-lg font-extrabold text-slate-900">Unable to load applicants</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{error}</p>
                        <div className="mt-5 flex justify-center gap-2"><Button variant="secondary" onClick={() => navigate("/admin/jobs")}>Back to jobs</Button><Button onClick={fetchApplicants}>Try again</Button></div>
                    </div>
                </Card>
            ) : (
                <>
                    <section className="mb-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Applicant status summary">
                        <MetricCard label="Total applicants" value={applicants.length} description="Applications received for this job" />
                        <MetricCard label="Pending review" value={pendingCount} description="Waiting for a status update" tone="amber" />
                        <MetricCard label="Shortlisted" value={shortlistedCount} description="Candidates moved forward" tone="green" />
                        <MetricCard label="Offers recorded" value={offeredCount} description="Applications marked Offered" tone="green" />
                    </section>

                    <Card className="mb-6 !p-4 sm:!p-5">
                        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px] md:items-end">
                            <Input label="Search applicants" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Name, email, branch, graduation year, or skill" />
                            <div className="w-full">
                                <label htmlFor="applicant-status-filter" className="mb-2 block text-sm font-semibold text-slate-700">Application status</label>
                                <select id="applicant-status-filter" value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
                                    {STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                            <p className="text-xs font-medium text-slate-500">Showing {visibleApplicants.length} of {applicants.length} applicant{applicants.length === 1 ? "" : "s"}{filterIsActive ? " after filters" : ""}</p>
                            {filterIsActive && <Button variant="secondary" onClick={() => { setSearch(""); setStatusFilter("All statuses"); }}>Clear filters</Button>}
                        </div>
                    </Card>

                    {applicants.length === 0 ? (
                        <Card className="!p-7 sm:!p-10">
                            <div className="mx-auto max-w-lg py-4 text-center">
                                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-[#365e85]" aria-hidden="true">◎</div>
                                <h2 className="mt-4 text-lg font-extrabold text-slate-900">No applicants yet</h2>
                                <p className="mt-2 text-sm leading-6 text-slate-600">Applications will appear here when eligible students apply to this role.</p>
                                <Button variant="secondary" className="mt-5" onClick={() => navigate("/admin/jobs")}>Return to jobs</Button>
                            </div>
                        </Card>
                    ) : visibleApplicants.length === 0 ? (
                        <Card className="!p-7 text-center">
                            <h2 className="text-lg font-extrabold text-slate-900">No applicants match these filters</h2>
                            <p className="mt-2 text-sm text-slate-600">Clear the filters or try a different search term.</p>
                            <Button variant="secondary" className="mt-4" onClick={() => { setSearch(""); setStatusFilter("All statuses"); }}>Clear filters</Button>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {visibleApplicants.map(application => (
                                <ApplicantCard
                                    key={application._id}
                                    application={application}
                                    updating={updatingApplicationId === application._id}
                                    onStatusChange={updateStatus}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </PageContainer>
    );
}
