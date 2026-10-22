import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import PageContainer from "../components/ui/PageContainer";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import "../styles/pages/profile-jobs.css";

const Icon = ({ type, className = "h-5 w-5" }) => {
  const paths = {
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    money: <><rect x="2.5" y="5" width="19" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 9H5m14 6h-1"/></>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6l8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-4.8"/></>,
    graduation: <><path d="m2 9 10-5 10 5-10 5L2 9Z"/><path d="M6 11v5c3.8 3 8.2 3 12 0v-5M22 9v6"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    building: <><path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M9 7h2m2 0h2M9 11h2m2 0h2M9 15h2m2 0h2"/></>,
  };
  return <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[type]}</svg>;
};

const formatSalary = value => {
  const amount = Number(value);
  return Number.isFinite(amount) ? `₹${amount.toLocaleString("en-IN")}` : "Not specified";
};
const formatDate = value => {
  if (!value) return "Not specified";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not specified" : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
const getInitials = value => String(value || "CO").trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();

export default function Jobs() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isCollegeAdmin, isStudent } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [location, setLocation] = useState("");
  const [submittedLocation, setSubmittedLocation] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [applied, setApplied] = useState([]);
  const [accessMessage, setAccessMessage] = useState("");

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      setJobs([]);
      return;
    }
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/jobs", {
        params: { keyword: submittedSearch, location: submittedLocation, sort, page },
      });
      setJobs(response.data.jobs || []);
      setTotalPages(response.data.totalPages || 1);
      setAccessMessage(response.data.accessMessage || "");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, submittedSearch, submittedLocation, sort, page]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!isStudent || user?.verificationStatus !== "verified") return;
    api.get("/applications/my?limit=1000")
      .then(response => setApplied((response.data.applications || [])
        .filter(application => application.job)
        .map(application => String(application.job._id))))
      .catch(() => {});
  }, [isStudent, user?.verificationStatus]);

  const hasFilters = Boolean(submittedSearch || submittedLocation);
  const verifiedStudent = isStudent && user?.verificationStatus === "verified";
  const canBrowseJobs = isAuthenticated && (!isStudent || verifiedStudent);

  return <PageContainer className="!py-7 sm:!py-10">
    <div className="mx-auto max-w-6xl min-w-0">
      <section className="relative isolate mb-8 overflow-hidden rounded-[26px] bg-[linear-gradient(115deg,#071b3b_0%,#0b2e61_58%,#1555a5_100%)] px-6 py-8 text-white shadow-[0_18px_50px_rgba(13,54,111,.17)] sm:px-9 sm:py-10 lg:px-11">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-[.12]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.28) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.28) 1px, transparent 1px)", backgroundSize: "44px 44px", maskImage: "linear-gradient(110deg, black, transparent 90%)" }} />
        <div className="pointer-events-none absolute -right-24 -top-32 -z-10 h-80 w-80 rounded-full border border-white/15 shadow-[0_0_0_36px_rgba(255,255,255,.035),0_0_0_76px_rgba(255,255,255,.025)]" />
        <div className="flex min-w-0 flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/20 bg-white/[.07] px-3 py-2 text-[10px] font-extrabold uppercase tracking-[.17em] text-blue-100"><span className="h-1.5 w-1.5 rounded-full bg-sky-300 shadow-[0_0_0_4px_rgba(125,211,252,.12)]" />Placement opportunities</div>
            <h1 className="mt-5 text-3xl font-extrabold leading-[1.08] tracking-[-.05em] text-white sm:text-4xl lg:text-[2.8rem]">Your next opportunity<br className="hidden sm:block"/> starts here.</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-blue-100/90 sm:text-base">Explore placements shared with your college, discover roles that match your goals, and take the next step in your career.</p>
            {user?.collegeName && <div className="mt-5 inline-flex max-w-full items-center gap-2 rounded-xl border border-white/15 bg-white/[.07] px-3 py-2 text-xs font-semibold text-blue-50"><Icon type="graduation" className="h-4 w-4 shrink-0 text-blue-200"/><span className="truncate">Opportunities for {user.collegeName}</span></div>}
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-3 md:min-w-[225px] md:grid-cols-1">
            <div className="rounded-2xl border border-white/15 bg-white/[.07] p-4 backdrop-blur-sm"><div className="text-[10px] font-bold uppercase tracking-[.14em] text-blue-200">Your access</div><div className="mt-2 text-sm font-bold">{!isAuthenticated ? "Sign in required" : isStudent && user?.verificationStatus !== "verified" ? "Verification pending" : "College-linked jobs"}</div></div>
            <div className="rounded-2xl border border-white/15 bg-white/[.07] p-4 backdrop-blur-sm"><div className="text-[10px] font-bold uppercase tracking-[.14em] text-blue-200">Search smarter</div><div className="mt-2 text-sm font-bold">Role · Company · Location</div></div>
          </div>
        </div>
      </section>

      {!isAuthenticated && <section className="mb-7 flex min-w-0 flex-col gap-4 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6"><div className="flex min-w-0 gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700"><Icon type="shield" className="h-5 w-5"/></span><div className="min-w-0"><h2 className="font-bold text-slate-900">Sign in to explore your opportunities</h2><p className="mt-1 text-sm leading-6 text-slate-500">Log in to view jobs available to your college and check application eligibility.</p></div></div><Button onClick={() => navigate("/login")} className="shrink-0">Sign in to continue <Icon type="arrow" className="h-4 w-4"/></Button></section>}

      {isStudent && user?.verificationStatus !== "verified" && <section className="mb-7 rounded-2xl border border-amber-200 bg-[linear-gradient(110deg,#fffbeb,#fff)] p-5 shadow-sm sm:p-6"><div className="flex min-w-0 items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-800"><span aria-hidden="true">◷</span></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-extrabold text-amber-950">Student verification required</h2><span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-800">{user?.verificationStatus || "pending"}</span></div><p className="mt-2 text-sm leading-6 text-amber-900/80">Your College Admin needs to verify your student ID before eligible placements are shown here.</p>{user?.verificationRejectionReason && <p className="mt-2 text-sm text-rose-700">Reason: {user.verificationRejectionReason}</p>}<Button className="mt-4" variant="secondary" onClick={() => navigate("/profile")}>Review your profile</Button></div></div></section>}

      {canBrowseJobs && <section className="mb-7 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgba(18,57,109,.045)] sm:p-5">
        <div className="mb-4 flex min-w-0 flex-wrap items-center justify-between gap-2"><div><h2 className="text-lg font-extrabold text-slate-900">Find your fit</h2><p className="mt-1 text-xs text-slate-500">Narrow down openings by role, employer, or location.</p></div>{isCollegeAdmin && <Button onClick={() => navigate("/admin/jobs")} variant="secondary" className="shrink-0"><Icon type="building" className="h-4 w-4"/> Manage jobs</Button>}</div>
        <form className="grid min-w-0 items-end gap-3 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_minmax(170px,.8fr)_auto]" onSubmit={event => { event.preventDefault(); setPage(1); setSubmittedSearch(search.trim()); setSubmittedLocation(location.trim()); }}>
          <div className="relative min-w-0"><Icon type="search" className="pointer-events-none absolute left-3 top-[39px] h-4 w-4 text-slate-400"/><Input label="Keyword" value={search} onChange={event => setSearch(event.target.value)} placeholder="Job title or company" className="!pl-9 !py-3"/></div>
          <div className="relative min-w-0"><Icon type="pin" className="pointer-events-none absolute left-3 top-[39px] h-4 w-4 text-slate-400"/><Input label="Location" value={location} onChange={event => setLocation(event.target.value)} placeholder="City or country" className="!pl-9 !py-3"/></div>
          <div className="min-w-0"><label htmlFor="jobs-sort" className="mb-2 block text-sm font-medium text-gray-700">Sort by</label><select id="jobs-sort" value={sort} onChange={event => { setSort(event.target.value); setPage(1); }} className="min-h-[46px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"><option value="latest">Most recent</option><option value="salary">Highest salary</option></select></div>
          <Button type="submit" className="inline-flex min-h-[46px] items-center justify-center gap-2 !px-5"><Icon type="search" className="h-4 w-4"/> Search</Button>
        </form>
        {(submittedSearch || submittedLocation) && <div className="mt-4 flex min-w-0 flex-wrap items-center gap-2 border-t border-slate-100 pt-4"><span className="text-xs font-semibold text-slate-500">Active filters</span>{submittedSearch && <span className="max-w-full break-words rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800">{submittedSearch}</span>}{submittedLocation && <span className="max-w-full break-words rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800">{submittedLocation}</span>}<button type="button" className="ml-auto text-xs font-bold text-[#245e9b] hover:text-[#173c63]" onClick={() => { setSearch(""); setLocation(""); setSubmittedSearch(""); setSubmittedLocation(""); setPage(1); }}>Clear filters</button></div>}
      </section>}

      {accessMessage && <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-sm leading-6 text-blue-900">{accessMessage}</div>}

      {loading ? <div className="grid min-w-0 gap-4" aria-busy="true" aria-label="Loading opportunities">{[0,1,2].map(n => <div key={n} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"><div className="flex min-w-0 gap-4"><div className="h-12 w-12 shrink-0 rounded-2xl bg-slate-100"/><div className="min-w-0 flex-1"><div className="h-4 w-2/5 rounded bg-slate-100"/><div className="mt-3 h-3 w-1/4 rounded bg-slate-100"/><div className="mt-5 h-3 w-3/4 rounded bg-slate-100"/><div className="mt-2 h-3 w-1/2 rounded bg-slate-100"/></div></div></div>)}</div>
      : error ? <section className="rounded-2xl border border-rose-100 bg-white p-8 text-center shadow-sm"><span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-rose-50 text-rose-700" aria-hidden="true">!</span><h2 className="mt-4 text-lg font-extrabold text-slate-900">We couldn't load opportunities</h2><p className="mt-2 text-sm text-slate-600">{error}</p><Button className="mt-5" onClick={load}>Try again</Button></section>
      : canBrowseJobs && jobs.length === 0 ? <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-[#245e9b]"><Icon type="search" className="h-6 w-6"/></span><h2 className="mt-5 text-xl font-extrabold text-slate-900">{hasFilters ? "No matching opportunities" : "No opportunities posted yet"}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{hasFilters ? "Try a different keyword or location, or clear your filters to broaden your search." : "New placements posted for your college will appear here. Check back as your placement season progresses."}</p>{hasFilters && <Button variant="secondary" className="mt-5" onClick={() => { setSearch(""); setLocation(""); setSubmittedSearch(""); setSubmittedLocation(""); setPage(1); }}>Clear filters</Button>}</section>
      : <>
        {canBrowseJobs && <div className="mb-4 flex min-w-0 flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-extrabold text-slate-800">Latest openings</p><p className="mt-1 text-xs text-slate-600">Open each role to review full details and eligibility before applying.</p></div><div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/>{jobs.length} {jobs.length === 1 ? "opportunity" : "opportunities"} on this page</div></div>}
        <div className="grid min-w-0 gap-4">{jobs.map(job => {
          const alreadyApplied = applied.includes(String(job._id));
          const deadline = job.deadline ? new Date(job.deadline) : null;
          const validDeadline = deadline && !Number.isNaN(deadline.getTime());
          const branches = Array.isArray(job.allowedBranches) ? job.allowedBranches.filter(Boolean) : [];
          return <article key={job._id} className="portal-job-card group min-w-0 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_3px_12px_rgba(18,57,109,.025)] transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_15px_35px_rgba(18,57,109,.08)] sm:p-6">
            <div className="flex min-w-0 flex-col gap-5 md:flex-row md:items-start">
              <div className="flex min-w-0 flex-1 gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-blue-100 bg-[linear-gradient(145deg,#edf5ff,#e2edff)] text-sm font-extrabold tracking-tight text-blue-800">{getInitials(job.company)}</div><div className="min-w-0 flex-1"><div className="flex min-w-0 flex-wrap items-center gap-2"><h2 className="break-words text-lg font-extrabold leading-snug tracking-[-.025em] text-slate-900 sm:text-xl">{job.title || "Untitled role"}</h2>{alreadyApplied && <span className="shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-800">Applied</span>}</div><p className="mt-1 break-words text-sm font-bold text-[#245e9b]">{job.company || "Company not specified"}</p>{job.college?.name && <p className="mt-1.5 inline-flex max-w-full items-center gap-1.5 break-words text-xs text-slate-600"><Icon type="building" className="h-3.5 w-3.5 shrink-0"/>{job.college.name}</p>}
                <div className="mt-4 flex min-w-0 flex-wrap gap-2">{job.location && <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700"><Icon type="pin" className="h-3.5 w-3.5 shrink-0 text-slate-500"/>{job.location}</span>}<span className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50/70 px-2.5 py-1.5 text-xs font-bold text-[#174f97]"><Icon type="money" className="h-3.5 w-3.5 shrink-0"/>{formatSalary(job.salary)}</span>{Number(job.minCgpa) > 0 && <span className="inline-flex items-center rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700">Min. CGPA {job.minCgpa}</span>}{validDeadline && <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700"><Icon type="calendar" className="h-3.5 w-3.5 shrink-0 text-slate-500"/>Deadline {formatDate(job.deadline)}</span>}</div>
                {branches.length > 0 && <p className="mt-4 break-words text-xs leading-5 text-slate-700"><span className="font-bold text-slate-800">Eligible branches:</span> {branches.join(", ")}</p>}
                {job.description && <p className="mt-4 line-clamp-3 break-words whitespace-pre-wrap text-sm leading-7 text-slate-600">{job.description}</p>}
              </div></div>
              <div className="flex min-w-0 shrink-0 flex-col gap-2 border-t border-slate-100 pt-4 md:w-44 md:border-l md:border-t-0 md:pl-5 md:pt-0">
                <Button onClick={() => navigate(`/jobs/${job._id}`)} className="w-full justify-center">View details <Icon type="arrow" className="h-4 w-4"/></Button>
                {isCollegeAdmin && <Button variant="secondary" onClick={() => navigate(`/admin/jobs/${job._id}/applicants`)} className="w-full">View applicants</Button>}
                {isStudent && alreadyApplied && <p className="text-center text-xs font-semibold text-emerald-800">Application submitted</p>}
              </div>
            </div>
          </article>;
        })}</div>
      </>}

      {isAuthenticated && totalPages > 1 && <nav aria-label="Opportunity pages" className="mt-7 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><Button variant="secondary" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</Button><span className="px-2 text-sm font-semibold tabular-nums text-slate-600">Page {page} of {totalPages}</span><Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage(value => value + 1)}>Next</Button></nav>}

      <div className="mt-8 flex min-w-0 flex-col items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div className="flex min-w-0 items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#245e9b]"><Icon type="shield" className="h-5 w-5"/></span><div className="min-w-0"><h2 className="text-sm font-extrabold text-slate-800">Opportunities tailored to your college</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-slate-600">Job visibility and application access follow your college affiliation and student verification status.</p></div></div>{isStudent && <button type="button" onClick={() => navigate("/profile")} className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-[#245e9b] transition hover:text-[#173c63]">View profile <Icon type="arrow" className="h-4 w-4"/></button>}</div>
    </div>
  </PageContainer>;
}
