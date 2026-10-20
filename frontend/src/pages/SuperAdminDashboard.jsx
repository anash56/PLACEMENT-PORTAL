import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import PageContainer from "../components/ui/PageContainer";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Textarea from "../components/ui/TextArea";

const statusOptions = [
    { value: "pending", label: "Pending requests" },
    { value: "approved", label: "Approved colleges" },
    { value: "rejected", label: "Rejected requests" },
    { value: "suspended", label: "Suspended colleges" }
];

const statusStyle = {
    pending: "bg-amber-50 text-amber-800 ring-amber-200",
    approved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    rejected: "bg-rose-50 text-rose-800 ring-rose-200",
    suspended: "bg-slate-100 text-slate-700 ring-slate-200"
};

function MetricCard({ label, value, detail }) {
    return <Card className="!rounded-2xl !border-slate-200 !p-5 !shadow-sm hover:!shadow-md">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">{Number.isFinite(Number(value)) ? Number(value).toLocaleString("en-IN") : "—"}</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">{detail}</p>
    </Card>;
}

export default function SuperAdminDashboard() {
    const [colleges, setColleges] = useState([]);
    const [status, setStatus] = useState("pending");
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");
    const [reasonById, setReasonById] = useState({});
    const [developmentSetupUrl, setDevelopmentSetupUrl] = useState("");
    const [stats, setStats] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setPageError("");
        const [collegeResult, statsResult] = await Promise.allSettled([
            api.get(`/colleges/admin/list?status=${encodeURIComponent(status)}`),
            api.get("/dashboard/stats")
        ]);

        if (collegeResult.status === "fulfilled") {
            setColleges(collegeResult.value.data.colleges || []);
        } else {
            setColleges([]);
            const message = collegeResult.reason?.response?.data?.message || "Failed to load college requests.";
            setPageError(message);
        }

        // A statistics failure must not disable the core college-management workflow.
        if (statsResult.status === "fulfilled") setStats(statsResult.value.data);
        else setStats(null);
        setLoading(false);
    }, [status]);

    useEffect(() => { load(); }, [load]);

    const act = async (college, action) => {
        const reason = (reasonById[college._id] || "").trim();
        if (["reject", "suspend"].includes(action) && !reason) {
            toast.error("Enter a reason before this action.");
            return;
        }

        try {
            const response = action === "invite"
                ? await api.post(`/colleges/admin/${college._id}/invite`)
                : await api.patch(`/colleges/admin/${college._id}/${action}`, { reason });
            const invitation = response.data.invitation;
            if (invitation?.developmentSetupUrl) {
                setDevelopmentSetupUrl(invitation.developmentSetupUrl);
                try { await navigator.clipboard?.writeText(invitation.developmentSetupUrl); } catch { /* manual copy stays available */ }
                toast.success("Development invitation link generated.");
            } else if (invitation && invitation.delivered === false) {
                toast.error("The college was updated, but email delivery was not confirmed. Check the mail configuration.");
            } else {
                toast.success(response.data.message || "College updated successfully.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "The action could not be completed.");
        } finally {
            // Approval may succeed even if sending the invitation email then fails; refresh persisted state either way.
            await load();
        }
    };

    return <PageContainer className="!bg-slate-50 !px-4 !py-7 sm:!py-10">
        <div className="mx-auto max-w-7xl">
            <header className="relative isolate mb-7 overflow-hidden rounded-[28px] bg-[linear-gradient(125deg,#071b3b_0%,#0b2e61_55%,#1456a3_100%)] p-6 text-white shadow-[0_20px_60px_rgba(18,57,109,0.18)] sm:p-9">
                <div className="pointer-events-none absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full border border-white/15 shadow-[0_0_0_35px_rgba(255,255,255,.035),0_0_0_75px_rgba(255,255,255,.025)]" />
                <p className="text-xs font-extrabold uppercase tracking-[.2em] text-blue-200">Platform administration</p>
                <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                    <div className="max-w-2xl">
                        <h1 className="text-3xl font-extrabold tracking-[-.04em] sm:text-4xl">College management</h1>
                        <p className="mt-3 text-sm leading-6 text-blue-100/85">Review institutional requests, control college access, and issue administrator invitations. College Admins manage only their own college’s jobs and student verification.</p>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold text-blue-50"><span className="h-2 w-2 rounded-full bg-emerald-300" /> Super Admin workspace</span>
                </div>
            </header>

            <section aria-label="Platform overview" className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Students" value={stats?.totalStudents} detail="Across the platform" />
                <MetricCard label="Published jobs" value={stats?.totalJobs} detail="Across approved college workspaces" />
                <MetricCard label="Applications" value={stats?.totalApplications} detail="Submitted through the portal" />
                <Card className="!rounded-2xl !border-blue-100 !bg-blue-50/70 !p-5 !shadow-sm">
                    <p className="text-sm font-semibold text-blue-800">Current queue</p>
                    <p className="mt-3 text-3xl font-extrabold tracking-tight text-blue-950">{statusOptions.find(option => option.value === status)?.label || "Colleges"}</p>
                    <p className="mt-1 text-xs leading-5 text-blue-800/70">{loading ? "Refreshing list…" : `${colleges.length} record${colleges.length === 1 ? "" : "s"} shown on this page`}</p>
                </Card>
            </section>

            {developmentSetupUrl && <Card className="mb-6 !rounded-2xl !border-blue-200 !bg-white !shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="text-xs font-extrabold uppercase tracking-[.16em] text-blue-700">Development invitation</p>
                        <h2 className="mt-1 text-lg font-bold text-slate-900">Setup link generated</h2>
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Email delivery is not configured in development. This link is shown only to the signed-in Super Admin and expires after 24 hours.</p>
                    </div>
                    <Button variant="secondary" onClick={() => setDevelopmentSetupUrl("")}>Hide link</Button>
                </div>
                <p className="mt-4 break-all rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{developmentSetupUrl}</p>
                <div className="mt-3"><Button onClick={async () => { try { await navigator.clipboard.writeText(developmentSetupUrl); toast.success("Invitation link copied."); } catch { toast.error("Copy failed. Select and copy the link manually."); } }}>Copy invitation link</Button></div>
            </Card>}

            <section className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-xs font-extrabold uppercase tracking-[.18em] text-blue-700">Institution records</p>
                    <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Manage colleges</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">Approve or reject new requests, resend setup invitations, or suspend and restore college access.</p>
                </div>
                <label className="block min-w-56">
                    <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">Filter by status</span>
                    <select className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100" value={status} onChange={event => setStatus(event.target.value)}>
                        {statusOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                </label>
            </section>

            {pageError && <Card className="mb-5 !rounded-2xl !border-rose-200 !bg-rose-50"><p role="alert" className="text-sm leading-6 text-rose-800">{pageError}</p><div className="mt-3"><Button variant="secondary" onClick={load}>Try again</Button></div></Card>}

            {loading ? <Card className="!rounded-2xl !border-slate-200 !shadow-sm"><div className="flex items-center gap-3 py-8 text-sm font-medium text-slate-500"><span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" /> Loading college records…</div></Card>
                : pageError ? null
                    : colleges.length === 0 ? <Card className="!rounded-2xl !border-slate-200 !shadow-sm"><div className="py-10 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700">✓</span><h3 className="mt-4 text-lg font-bold text-slate-900">Nothing to review here</h3><p className="mt-1 text-sm text-slate-500">There are no colleges in the “{status}” category.</p></div></Card>
                        : <div className="space-y-4">{colleges.map(college => <Card key={college._id} className="!rounded-2xl !border-slate-200 !p-5 !shadow-sm sm:!p-6">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <h3 className="text-xl font-extrabold tracking-tight text-slate-900">{college.name}</h3>
                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide ring-1 ${statusStyle[college.status] || statusStyle.pending}`}>{college.status}</span>
                                    </div>
                                    <p className="mt-2 text-sm font-semibold text-slate-700">{college.contactPerson}{college.contactDesignation ? ` · ${college.contactDesignation}` : ""}</p>
                                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500"><span>{college.contactEmail}</span><span>{college.contactPhone}</span></div>
                                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{college.address}</p>
                                    {college.website && <a className="mt-2 inline-block break-all text-sm font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4 hover:text-blue-900" target="_blank" rel="noreferrer" href={college.website}>{college.website}</a>}
                                    {college.admin && <div className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-xs text-emerald-900"><span className="font-extrabold">Assigned admin</span><span>{college.admin.name} · {college.admin.email}</span></div>}
                                    {college.rejectionReason && <p className="mt-3 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-800"><strong>Rejection reason:</strong> {college.rejectionReason}</p>}
                                    {college.reviewReason && <p className="mt-3 text-xs leading-5 text-slate-500"><strong>Latest review note:</strong> {college.reviewReason}</p>}
                                </div>
                            </div>

                            <div className="mt-5 border-t border-slate-100 pt-5">
                                <Textarea label={status === "pending" ? "Review note (optional; required for rejection)" : "Reason (required for suspension)"} rows={2} value={reasonById[college._id] || ""} onChange={event => setReasonById(previous => ({ ...previous, [college._id]: event.target.value }))} />
                                <div className="mt-4 flex flex-wrap gap-2.5">
                                    {status === "pending" && <>
                                        <Button onClick={() => act(college, "approve")}>Approve & invite Admin</Button>
                                        <Button variant="danger" onClick={() => act(college, "reject")}>Reject request</Button>
                                    </>}
                                    {status === "approved" && <>
                                        <Button variant="secondary" onClick={() => act(college, "invite")}>Send Admin invitation</Button>
                                        <Button variant="danger" onClick={() => act(college, "suspend")}>Suspend college</Button>
                                    </>}
                                    {status === "suspended" && <Button onClick={() => act(college, "restore")}>Restore college access</Button>}
                                    {status === "rejected" && <>
                                        <Button onClick={() => act(college, "approve")}>Reconsider &amp; approve</Button>
                                        <p className="self-center text-xs leading-5 text-slate-400">This reuses the existing Super Admin approval workflow and sends a fresh administrator invitation.</p>
                                    </>}
                                </div>
                            </div>
                        </Card>)}</div>}

            <p className="mt-6 text-center text-xs leading-5 text-slate-400">Platform-level actions are restricted to Super Admins. College Admin access remains limited to the college assigned to that account.</p>
        </div>
    </PageContainer>;
}
