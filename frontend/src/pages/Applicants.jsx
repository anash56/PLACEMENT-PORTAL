import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import PageContainer from "../components/ui/PageContainer";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import AdminPageHeader from "../components/admin/AdminPageHeader";
import ApplicantCard from "../components/admin/applicants/ApplicantCard";

const FINAL_STATUSES = new Set(["Selected", "Offered", "Rejected", "Withdrawn"]);

function csvCell(value) {
    let text = String(value ?? "");

    // Skip whitespace and control characters before checking for formulas.
    let index = 0;

    while (index < text.length) {
        const character = text[index];
        const code = text.charCodeAt(index);

        if (/\s/.test(character) || code <= 0x1f) {
            index++;
        } else {
            break;
        }
    }

    // Prevent spreadsheet formula injection.
    if (["=", "+", "-", "@"].includes(text[index])) {
        text = `'${text}`;
    }

    return `"${text.replace(/"/g, '""')}"`;
}

function MetricCard({ label, value, description, tone = "slate" }) {
    const valueClass =
        tone === "green"
            ? "text-emerald-800"
            : tone === "amber"
                ? "text-amber-800"
                : "text-slate-900";

    return (
        <Card className="!p-4 sm:!p-5">
            <p className="text-xs font-bold text-slate-600">{label}</p>
            <p className={`mt-2 text-2xl font-extrabold tracking-tight ${valueClass}`}>
                {value.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-600">{description}</p>
        </Card>
    );
}

export default function Applicants() {
    const { jobId } = useParams();
    const navigate = useNavigate();

    const [applicants, setApplicants] = useState([]);
    const [totalApplications, setTotalApplications] = useState(0);
    const [allApplicantsCount, setAllApplicantsCount] = useState(0);
    const [statusCounts, setStatusCounts] = useState({});
    const [availableStatuses, setAvailableStatuses] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [submittedSearch, setSubmittedSearch] = useState("");
    const [exporting, setExporting] = useState(false);
    const requestSequence = useRef(0);

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingApplicationId, setUpdatingApplicationId] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All statuses");

    // Debounce search input before requesting matching applicants.
    useEffect(() => {
        const timer = window.setTimeout(() => {
            setPage(1);
            setSubmittedSearch(search.trim());
        }, 300);

        return () => window.clearTimeout(timer);
    }, [search]);

    const fetchApplicants = useCallback(async () => {
        const requestId = ++requestSequence.current;

        try {
            setLoading(true);
            setError("");

            const [applicationsResponse, jobResponse] = await Promise.all([
                api.get(`/applications/job/${jobId}`, {
                    params: {
                        page,
                        limit: 10,
                        search: submittedSearch || undefined,
                        status:
                            statusFilter === "All statuses"
                                ? undefined
                                : statusFilter,
                    },
                }),
                api.get(`/jobs/${jobId}`),
            ]);

            // Ignore stale responses from previous requests.
            if (requestId !== requestSequence.current) return;

            const data = applicationsResponse.data || {};
            const applicationList = Array.isArray(data)
                ? data
                : Array.isArray(data.applications)
                    ? data.applications
                    : [];

            setApplicants(applicationList);
            setTotalApplications(
                Number(data.totalApplications ?? applicationList.length)
            );
            setAllApplicantsCount(
                Number(data.allApplicationsCount ?? applicationList.length)
            );
            setStatusCounts(data.statusCounts || {});
            setAvailableStatuses(
                Array.isArray(data.availableStatuses)
                    ? data.availableStatuses
                    : []
            );
            setTotalPages(Math.max(1, Number(data.totalPages || 1)));
            setPage(Math.max(1, Number(data.currentPage || page)));
            setJob(jobResponse.data.job || jobResponse.data || null);
        } catch (requestError) {
            if (requestId !== requestSequence.current) return;

            setError(
                requestError.response?.data?.message ||
                "Could not load the applicants for this job."
            );
        } finally {
            if (requestId === requestSequence.current) {
                setLoading(false);
            }
        }
    }, [jobId, page, submittedSearch, statusFilter]);
    useEffect(() => {
        // Fetch initial applicant data from the API.
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Initial asynchronous API request.
        void fetchApplicants();

        return () => {
            requestSequence.current += 1;
        };
    }, [fetchApplicants]);

    const visibleApplicants = applicants;

    const updateStatus = async (applicationId, updates) => {
        const currentApplication = applicants.find(
            application => application._id === applicationId
        );

        if (
            !currentApplication ||
            currentApplication.status === updates.status
        ) {
            return false;
        }

        try {
            setUpdatingApplicationId(applicationId);

            await api.patch(`/applications/${applicationId}`, updates);
            await fetchApplicants();

            toast.success("Application workflow updated.");
            return true;
        } catch (requestError) {
            toast.error(
                requestError.response?.data?.message ||
                "Could not update the application status."
            );
            return false;
        } finally {
            setUpdatingApplicationId(null);
        }
    };

    const exportVisibleApplicants = async () => {
        if (totalApplications === 0) {
            toast.error(
                "There are no applicants matching the current filters to export."
            );
            return;
        }

        try {
            setExporting(true);

            const params = {
                limit: 50,
                page: 1,
                search: submittedSearch || undefined,
                status:
                    statusFilter === "All statuses"
                        ? undefined
                        : statusFilter,
            };

            const firstResponse = await api.get(
                `/applications/job/${jobId}`,
                { params }
            );

            const firstData = firstResponse.data || {};
            const exportRows = Array.isArray(firstData.applications)
                ? [...firstData.applications]
                : [];
            const exportPages = Math.max(
                1,
                Number(firstData.totalPages || 1)
            );

            for (
                let exportPage = 2;
                exportPage <= exportPages;
                exportPage += 1
            ) {
                const response = await api.get(
                    `/applications/job/${jobId}`,
                    {
                        params: {
                            ...params,
                            page: exportPage,
                        },
                    }
                );

                if (Array.isArray(response.data?.applications)) {
                    exportRows.push(...response.data.applications);
                }
            }

            if (exportRows.length === 0) {
                toast.error(
                    "There are no applicants matching the current filters to export."
                );
                return;
            }

            const headers = [
                "Student Name",
                "Student Email",
                "Branch",
                "CGPA",
                "Graduation Year",
                "Contact Number",
                "Application Status",
                "Applied Date",
            ];

            const rows = exportRows.map(application => {
                const student = application.student || {};
                const date = new Date(application.createdAt);

                const appliedDate =
                    application.createdAt && !Number.isNaN(date.getTime())
                        ? date.toISOString().slice(0, 10)
                        : "";

                return [
                    student.name || "Unknown Student",
                    student.email || "",
                    student.branch || "Unspecified",
                    student.cgpa ?? "",
                    student.graduationYear || "",
                    student.contactNumber || "",
                    application.status || "Unknown",
                    appliedDate,
                ];
            });

            const csv =
                "\uFEFF" +
                [headers, ...rows]
                    .map(row => row.map(csvCell).join(","))
                    .join("\r\n");

            const objectUrl = URL.createObjectURL(
                new Blob([csv], { type: "text/csv;charset=utf-8;" })
            );

            const link = document.createElement("a");
            link.href = objectUrl;
            link.download = `applicants-${jobId}-${new Date()
                .toISOString()
                .slice(0, 10)}.csv`;
            link.style.display = "none";

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);

            toast.success(
                `Exported ${exportRows.length} applicant${exportRows.length === 1 ? "" : "s"
                }.`
            );
        } catch (requestError) {
            toast.error(
                requestError.response?.data?.message ||
                "Could not export applicants. Please try again."
            );
        } finally {
            setExporting(false);
        }
    };

    const activeCount = Object.entries(statusCounts).reduce(
        (sum, [status, count]) =>
            sum +
            (FINAL_STATUSES.has(status) ? 0 : Number(count || 0)),
        0
    );

    const selectedCount =
        Number(statusCounts.Selected || 0) +
        Number(statusCounts.Offered || 0);
    const rejectedCount = Number(statusCounts.Rejected || 0);
    const filterIsActive =
        Boolean(search.trim()) || statusFilter !== "All statuses";

    const clearFilters = () => {
        setSearch("");
        setSubmittedSearch("");
        setStatusFilter("All statuses");
        setPage(1);
    };

    return (
        <PageContainer>
            <AdminPageHeader
                title="Applicants"
                description={
                    job?.title
                        ? `Review candidates for ${job.title}${job.company ? ` at ${job.company}` : ""
                        }.`
                        : "Review candidate profiles and manage each job's configured workflow."
                }
                actions={
                    <>
                        <Button
                            onClick={exportVisibleApplicants}
                            disabled={
                                loading ||
                                exporting ||
                                totalApplications === 0
                            }
                        >
                            {exporting ? "Preparing CSV…" : "Export CSV"}
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => navigate("/admin/jobs")}
                        >
                            Back to jobs
                        </Button>
                    </>
                }
            />

            {loading ? (
                <div
                    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
                    aria-busy="true"
                    aria-label="Loading applicant summary"
                >
                    {[1, 2, 3, 4].map(item => (
                        <Card key={item} className="!p-5">
                            <div className="animate-pulse space-y-3">
                                <div className="h-3 w-2/5 rounded bg-slate-100" />
                                <div className="h-7 w-1/3 rounded bg-slate-100" />
                                <div className="h-3 w-3/4 rounded bg-slate-50" />
                            </div>
                        </Card>
                    ))}
                </div>
            ) : error ? (
                <Card className="!p-6 sm:!p-8">
                    <div className="mx-auto max-w-lg py-4 text-center">
                        <h2 className="text-lg font-extrabold text-slate-900">
                            Unable to load applicants
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            {error}
                        </p>
                        <div className="mt-5 flex justify-center gap-2">
                            <Button
                                variant="secondary"
                                onClick={() => navigate("/admin/jobs")}
                            >
                                Back to jobs
                            </Button>
                            <Button onClick={fetchApplicants}>
                                Try again
                            </Button>
                        </div>
                    </div>
                </Card>
            ) : (
                <>
                    <section
                        className="mb-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
                        aria-label="Applicant summary"
                    >
                        <MetricCard
                            label="Total applicants"
                            value={allApplicantsCount}
                            description="Applications received for this job"
                        />
                        <MetricCard
                            label="In progress"
                            value={activeCount}
                            description="Currently in a configured stage"
                            tone="amber"
                        />
                        <MetricCard
                            label="Selected"
                            value={selectedCount}
                            description="Applications with a recorded selection outcome"
                            tone="green"
                        />
                        <MetricCard
                            label="Rejected"
                            value={rejectedCount}
                            description="Applications with a recorded rejection outcome"
                        />
                    </section>

                    <Card className="mb-6 !p-4 sm:!p-5">
                        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px] md:items-end">
                            <Input
                                label="Search applicants"
                                type="search"
                                value={search}
                                onChange={event =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Name, email, branch, graduation year, or skill"
                            />

                            <div className="w-full">
                                <label
                                    htmlFor="applicant-status-filter"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Current workflow status
                                </label>
                                <select
                                    id="applicant-status-filter"
                                    value={statusFilter}
                                    onChange={event => {
                                        setStatusFilter(event.target.value);
                                        setPage(1);
                                    }}
                                    className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
                                >
                                    <option value="All statuses">
                                        All statuses
                                    </option>
                                    {availableStatuses.map(status => (
                                        <option key={status} value={status}>
                                            {status}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                            <p className="text-xs font-medium text-slate-600">
                                Showing {applicants.length} of{" "}
                                {totalApplications.toLocaleString("en-IN")}{" "}
                                matching applicant
                                {totalApplications === 1 ? "" : "s"}
                                {totalPages > 1
                                    ? ` · Page ${page} of ${totalPages}`
                                    : ""}
                            </p>

                            {filterIsActive && (
                                <Button
                                    variant="secondary"
                                    onClick={clearFilters}
                                >
                                    Clear filters
                                </Button>
                            )}
                        </div>
                    </Card>

                    {allApplicantsCount === 0 ? (
                        <Card className="!p-7 sm:!p-10">
                            <div className="mx-auto max-w-lg py-4 text-center">
                                <div
                                    className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-slate-200 bg-slate-50 text-[#365e85]"
                                    aria-hidden="true"
                                >
                                    ◎
                                </div>
                                <h2 className="mt-4 text-lg font-extrabold text-slate-900">
                                    No applicants yet
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                    Applications will appear here when eligible
                                    students apply to this role.
                                </p>
                                <Button
                                    variant="secondary"
                                    className="mt-5"
                                    onClick={() => navigate("/admin/jobs")}
                                >
                                    Return to jobs
                                </Button>
                            </div>
                        </Card>
                    ) : totalApplications === 0 ? (
                        <Card className="!p-7 text-center">
                            <h2 className="text-lg font-extrabold text-slate-900">
                                No applicants match these filters
                            </h2>
                            <p className="mt-2 text-sm text-slate-600">
                                Clear the filters or try a different search
                                term.
                            </p>
                            <Button
                                variant="secondary"
                                className="mt-4"
                                onClick={clearFilters}
                            >
                                Clear filters
                            </Button>
                        </Card>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {visibleApplicants.map(application => (
                                    <ApplicantCard
                                        key={application._id}
                                        application={application}
                                        job={job}
                                        updating={
                                            updatingApplicationId ===
                                            application._id
                                        }
                                        onStatusChange={updateStatus}
                                    />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <nav
                                    aria-label="Applicant pages"
                                    className="mt-7 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                                >
                                    <Button
                                        variant="secondary"
                                        disabled={loading || page <= 1}
                                        onClick={() =>
                                            setPage(value =>
                                                Math.max(1, value - 1)
                                            )
                                        }
                                    >
                                        Previous
                                    </Button>

                                    <span className="px-2 text-sm font-semibold tabular-nums text-slate-600">
                                        Page {page} of {totalPages}
                                    </span>

                                    <Button
                                        variant="secondary"
                                        disabled={
                                            loading || page >= totalPages
                                        }
                                        onClick={() =>
                                            setPage(value =>
                                                Math.min(totalPages, value + 1)
                                            )
                                        }
                                    >
                                        Next
                                    </Button>
                                </nav>
                            )}
                        </>
                    )}
                </>
            )}
        </PageContainer>
    );
}
