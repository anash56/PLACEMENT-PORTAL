import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import PageContainer from "../components/ui/PageContainer";
import DashboardStatCard from "../components/admin/dashboard/DashboardStatCard";
import NeedsAttentionPanel from "../components/admin/dashboard/NeedsAttentionPanel";
import PlacementAnalytics from "../components/admin/dashboard/PlacementAnalytics";
import RecentActivity from "../components/admin/dashboard/RecentActivity";

const EMPTY_STATS = {
    totalStudents: 0,
    totalJobs: 0,
    totalApplications: 0,
    pendingStudentVerifications: 0,
    upcomingDeadlineCount: 0,
    upcomingDeadlines: [],
    recentJobs: [],
    recentApplications: [],
    statusBreakdown: {},
    branchBreakdown: [],
    salaryStats: { averageSalary: 0, maxSalary: 0, minSalary: 0 },
    placedSalaryStats: { averagePlacedSalary: 0, maxPlacedSalary: 0, minPlacedSalary: 0 },
};

const FINAL_STATUSES = new Set(["Selected", "Offered", "Rejected", "Withdrawn"]);

function mergeStats(data = {}) {
    return {
        ...EMPTY_STATS,
        ...data,
        statusBreakdown: { ...(data.statusBreakdown || {}) },
        salaryStats: { ...EMPTY_STATS.salaryStats, ...(data.salaryStats || {}) },
        placedSalaryStats: { ...EMPTY_STATS.placedSalaryStats, ...(data.placedSalaryStats || {}) },
        branchBreakdown: Array.isArray(data.branchBreakdown) ? data.branchBreakdown : [],
        upcomingDeadlines: Array.isArray(data.upcomingDeadlines) ? data.upcomingDeadlines : [],
        recentJobs: Array.isArray(data.recentJobs) ? data.recentJobs : [],
        recentApplications: Array.isArray(data.recentApplications) ? data.recentApplications : [],
    };
}

function AdminDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState(EMPTY_STATS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboardStats = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const { data } = await api.get("/dashboard/stats");
            setStats(mergeStats(data));
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Failed to load dashboard statistics.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchDashboardStats(); }, [fetchDashboardStats]);

    const totalStudents = Number(stats.totalStudents || 0);
    const totalJobs = Number(stats.totalJobs || 0);
    const totalApplications = Number(stats.totalApplications || 0);
    const statusBreakdown = stats.statusBreakdown || {};
    const activeApplications = Object.entries(statusBreakdown).reduce((total, [status, count]) => (
        total + (FINAL_STATUSES.has(status) ? 0 : Number(count || 0))
    ), 0);
    // "Offered" is included only to account for older application records.
    const selectedApplications = Number(statusBreakdown.Selected || 0) + Number(statusBreakdown.Offered || 0);

    const statCards = [
        {
            label: "Total students",
            value: totalStudents.toLocaleString("en-IN"),
            description: "Student accounts registered with your college",
        },
        {
            label: "Average selected CTC",
            value: selectedApplications > 0 ? `₹${Number(stats.placedSalaryStats?.averagePlacedSalary || 0).toLocaleString("en-IN")}` : "—",
            description: selectedApplications > 0 ? "Average package for applications with a selection outcome" : "Appears when an application is marked Selected",
            tone: "success",
        },
        {
            label: "Total jobs",
            value: totalJobs.toLocaleString("en-IN"),
            description: "Job opportunities in your college workspace",
            actionLabel: "Manage jobs",
            onAction: () => navigate("/admin/jobs"),
        },
        {
            label: "Total applications",
            value: totalApplications.toLocaleString("en-IN"),
            description: "Applications received by your college's jobs",
            actionLabel: "Review applicants",
            onAction: () => navigate("/admin/jobs"),
        },
    ];

    return (
        <PageContainer>
            <header className="relative isolate mb-7 overflow-hidden rounded-[26px] bg-[linear-gradient(125deg,#071b3b_0%,#0b2e61_55%,#1456a3_100%)] p-6 text-white shadow-[0_18px_50px_rgba(13,54,111,.15)] sm:p-8 lg:p-9">
                <div className="pointer-events-none absolute -right-16 -top-24 -z-10 h-64 w-64 rounded-full border border-white/15 shadow-[0_0_0_32px_rgba(255,255,255,.035),0_0_0_68px_rgba(255,255,255,.025)]" />
                <p className="text-xs font-extrabold uppercase tracking-[.2em] text-blue-200">College placement workspace</p>
                <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div className="max-w-2xl">
                        <h1 className="text-3xl font-extrabold leading-tight tracking-[-.04em] text-white sm:text-4xl">Admin dashboard</h1>
                        <p className="mt-2 text-sm leading-6 text-blue-100/90 sm:text-base">Welcome back, {user?.name || "Admin"}. Here is your college placement overview.</p>
                        {user?.collegeName && <p className="mt-3 inline-flex max-w-full items-center rounded-full border border-white/15 bg-white/[.07] px-3 py-1.5 text-xs font-semibold text-blue-50"><span className="truncate">{user.collegeName}</span></p>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="secondary" onClick={() => navigate("/admin/jobs/create")} className="!border-white/70 !bg-white !text-blue-900 hover:!bg-blue-50">Create job</Button>
                        <Button variant="secondary" onClick={() => navigate("/admin/jobs")} className="!border-white/30 !bg-white/10 !text-white hover:!bg-white/15">Manage jobs</Button>
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="space-y-7" aria-label="Loading dashboard" aria-busy="true">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {[1, 2, 3, 4].map(item => <Card key={item} className="!rounded-2xl !p-5"><div className="h-4 w-2/5 animate-pulse rounded bg-slate-100" /><div className="mt-4 h-8 w-3/5 animate-pulse rounded bg-slate-100" /><div className="mt-3 h-3 w-4/5 animate-pulse rounded bg-slate-50" /></Card>)}
                    </div>
                    <Card className="!rounded-2xl"><p className="text-sm text-slate-600">Loading placement statistics…</p></Card>
                </div>
            ) : error ? (
                <Card className="!rounded-2xl">
                    <div className="py-7 text-center">
                        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-lg font-bold text-[#245e9b]" aria-hidden="true">!</div>
                        <h2 className="mt-4 text-lg font-bold text-slate-900">Unable to load dashboard</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{error}</p>
                        <Button className="mt-5" onClick={fetchDashboardStats}>Try again</Button>
                    </div>
                </Card>
            ) : (
                <>
                    <section aria-label="Placement overview">
                        <div className="mb-4">
                            <h2 className="text-xl font-extrabold text-slate-900">Placement overview</h2>
                            <p className="mt-1 text-sm text-slate-600">A snapshot of students, jobs, applications, and outcomes.</p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {statCards.map(stat => <DashboardStatCard key={stat.label} {...stat} />)}
                        </div>
                    </section>

                    <NeedsAttentionPanel
                        activeApplications={activeApplications}
                        pendingStudentVerifications={Number(stats.pendingStudentVerifications || 0)}
                        upcomingDeadlineCount={Number(stats.upcomingDeadlineCount || 0)}
                        upcomingDeadlines={stats.upcomingDeadlines}
                        onReviewJobs={() => navigate("/admin/jobs")}
                        onVerifyStudents={() => navigate("/admin/students/verification")}
                    />

                    <PlacementAnalytics
                        totalApplications={totalApplications}
                        totalJobs={totalJobs}
                        statusBreakdown={statusBreakdown}
                        branchBreakdown={stats.branchBreakdown}
                        salaryStats={stats.salaryStats}
                        placedSalaryStats={stats.placedSalaryStats}
                        offeredApplications={selectedApplications}
                    />

                    <RecentActivity
                        jobs={stats.recentJobs}
                        applications={stats.recentApplications}
                        onManageJobs={() => navigate("/admin/jobs")}
                        onEditJob={jobId => navigate(`/admin/jobs/${jobId}/edit`)}
                        onViewApplicants={jobId => navigate(`/admin/jobs/${jobId}/applicants`)}
                    />
                </>
            )}
        </PageContainer>
    );
}

export default AdminDashboard;
