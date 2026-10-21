import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import PageContainer from "../components/ui/PageContainer";
import Button from "../components/ui/Button";
import PlatformMetricCard from "../components/super-admin/PlatformMetricCard";
import CollegeDirectoryFilters from "../components/super-admin/CollegeDirectoryFilters";
import CollegeRecordCard from "../components/super-admin/CollegeRecordCard";
import InvitationLinkNotice from "../components/super-admin/InvitationLinkNotice";

const STATUS_OPTIONS = [
    { value: "all", label: "All colleges" },
    { value: "pending", label: "Pending requests" },
    { value: "approved", label: "Approved colleges" },
    { value: "rejected", label: "Rejected requests" },
    { value: "suspended", label: "Suspended colleges" },
];

const EMPTY_COUNTS = { all: 0, pending: 0, approved: 0, rejected: 0, suspended: 0 };

export default function SuperAdminDashboard() {
    const [colleges, setColleges] = useState([]);
    const [status, setStatus] = useState("pending");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");
    const [reasonById, setReasonById] = useState({});
    const [activeAction, setActiveAction] = useState(null);
    const [developmentSetupUrl, setDevelopmentSetupUrl] = useState("");
    const [stats, setStats] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setPageError("");
        const [collegeResult, statsResult] = await Promise.allSettled([
            api.get("/colleges/admin/list"),
            api.get("/dashboard/stats"),
        ]);

        if (collegeResult.status === "fulfilled") {
            setColleges(Array.isArray(collegeResult.value.data.colleges) ? collegeResult.value.data.colleges : []);
        } else {
            setColleges([]);
            setPageError(collegeResult.reason?.response?.data?.message || "Failed to load college records.");
        }
        setStats(statsResult.status === "fulfilled" ? statsResult.value.data : null);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const counts = useMemo(() => colleges.reduce((result, college) => {
        result.all += 1;
        if (Object.prototype.hasOwnProperty.call(result, college.status)) result[college.status] += 1;
        return result;
    }, { ...EMPTY_COUNTS }), [colleges]);

    const visibleColleges = useMemo(() => {
        const query = search.trim().toLocaleLowerCase();
        return colleges.filter(college => {
            if (status !== "all" && college.status !== status) return false;
            if (!query) return true;
            const searchable = [college.name, college.contactPerson, college.contactDesignation, college.contactEmail, college.contactPhone, college.address, college.website]
                .filter(Boolean).join(" ").toLocaleLowerCase();
            return searchable.includes(query);
        });
    }, [colleges, search, status]);

    const act = async (college, action) => {
        const reason = (reasonById[college._id] || "").trim();
        if (["reject", "suspend"].includes(action) && !reason) {
            toast.error(action === "reject" ? "Add a reason before rejecting this request." : "Add a reason before suspending this college.");
            return;
        }

        setActiveAction(`${college._id}:${action}`);
        try {
            const response = action === "invite"
                ? await api.post(`/colleges/admin/${college._id}/invite`)
                : await api.patch(`/colleges/admin/${college._id}/${action}`, { reason });
            const invitation = response.data.invitation;
            if (invitation?.developmentSetupUrl) {
                setDevelopmentSetupUrl(invitation.developmentSetupUrl);
                try { await navigator.clipboard?.writeText(invitation.developmentSetupUrl); } catch { /* manual copy remains available */ }
                toast.success("Development invitation link generated.");
            } else if (invitation && invitation.delivered === false) {
                toast.error("The college was updated, but email delivery was not confirmed. Check the mail configuration.");
            } else {
                toast.success(response.data.message || "College updated successfully.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "The action could not be completed.");
        } finally {
            setActiveAction(null);
            await load();
        }
    };

    return (
        <PageContainer className="!px-4 !py-7 sm:!py-10">
            <div className="mx-auto max-w-7xl">
                <header className="relative isolate mb-7 overflow-hidden rounded-[26px] bg-[linear-gradient(115deg,#071b3b_0%,#0b2e61_58%,#1555a5_100%)] p-6 text-white shadow-[0_18px_50px_rgba(13,54,111,.17)] sm:p-9">
                    <div className="pointer-events-none absolute inset-0 -z-10 opacity-[.12]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.28) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.28) 1px, transparent 1px)", backgroundSize: "44px 44px", maskImage: "linear-gradient(110deg, black, transparent 90%)" }} />
                    <div className="pointer-events-none absolute -right-24 -top-32 -z-10 h-80 w-80 rounded-full border border-white/15 shadow-[0_0_0_36px_rgba(255,255,255,.035),0_0_0_76px_rgba(255,255,255,.025)]" />
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-blue-200">Platform administration</p>
                            <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-.045em] text-white sm:text-4xl">College management</h1>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100/90">Review institutional requests, control college access, and manage College Admin invitations across the placement network.</p>
                        </div>
                        <Button variant="secondary" onClick={load} disabled={loading} className="shrink-0 !border-white/30 !bg-white/10 !text-white hover:!bg-white/15">{loading ? "Refreshing…" : "Refresh records"}</Button>
                    </div>
                </header>

                <section aria-label="Platform overview" className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <PlatformMetricCard label="Students" value={stats?.totalStudents} detail="Across the platform" />
                    <PlatformMetricCard label="Jobs" value={stats?.totalJobs} detail="Across college workspaces" />
                    <PlatformMetricCard label="Applications" value={stats?.totalApplications} detail="Submitted through the portal" />
                    <PlatformMetricCard label="College requests" value={counts.pending} detail="Waiting for review" tone="attention" />
                </section>

                {developmentSetupUrl && <InvitationLinkNotice url={developmentSetupUrl} onDismiss={() => setDevelopmentSetupUrl("")} />}

                <section aria-labelledby="college-directory-heading">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-slate-500">Institution records</p>
                            <h2 id="college-directory-heading" className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Manage colleges</h2>
                            <p className="mt-1 text-sm leading-6 text-slate-500">Approve requests, issue setup invitations, or suspend and restore access.</p>
                        </div>
                        <p className="text-sm font-semibold text-slate-500" aria-live="polite">{loading ? "Updating records…" : `${visibleColleges.length} of ${colleges.length} colleges`}</p>
                    </div>

                    <CollegeDirectoryFilters status={status} onStatusChange={setStatus} search={search} onSearchChange={setSearch} counts={counts} statusOptions={STATUS_OPTIONS} />

                    {pageError && <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-5"><p role="alert" className="text-sm leading-6 text-rose-800">{pageError}</p><Button variant="secondary" className="mt-3" onClick={load}>Try again</Button></div>}

                    {loading ? (
                        <div className="grid gap-4" aria-label="Loading college records" aria-busy="true">
                            {[1, 2].map(item => <div key={item} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"><div className="h-5 w-1/3 rounded bg-slate-100" /><div className="mt-3 h-4 w-1/2 rounded bg-slate-100" /><div className="mt-6 h-20 rounded-xl bg-slate-50" /></div>)}
                        </div>
                    ) : pageError ? null : visibleColleges.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
                            <span aria-hidden="true" className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-xl text-slate-600">⌕</span>
                            <h3 className="mt-4 text-lg font-bold text-slate-900">{search.trim() ? "No matching colleges" : "Nothing to review here"}</h3>
                            <p className="mx-auto mt-1 max-w-lg text-sm leading-6 text-slate-500">{search.trim() ? "Try another institution name, contact email, or location, or clear the search." : `There are no ${status === "all" ? "college records" : `${status} colleges`} to display.`}</p>
                            {search && <Button variant="secondary" className="mt-4" onClick={() => setSearch("")}>Clear search</Button>}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {visibleColleges.map(college => <CollegeRecordCard
                                key={college._id}
                                college={college}
                                reason={reasonById[college._id] || ""}
                                onReasonChange={value => setReasonById(previous => ({ ...previous, [college._id]: value }))}
                                onAction={action => act(college, action)}
                                busyAction={activeAction?.startsWith(`${college._id}:`) ? activeAction.split(":")[1] : null}
                            />)}
                        </div>
                    )}
                </section>

                <p className="mt-7 text-center text-xs leading-5 text-slate-400">Platform-level actions are restricted to Super Admins. College Admin access remains limited to the college assigned to that account.</p>
            </div>
        </PageContainer>
    );
}
