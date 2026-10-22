import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import PageContainer from "../components/ui/PageContainer";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import "../styles/pages/profile-jobs.css";

const Icon = ({ type, className = "h-5 w-5" }) => {
  const paths = {
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    money: <><rect x="2.5" y="5" width="19" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 9H5m14 6h-1"/></>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    building: <><path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M9 7h2m2 0h2M9 11h2m2 0h2M9 15h2m2 0h2"/></>,
    graduation: <><path d="m2 9 10-5 10 5-10 5L2 9Z"/><path d="M6 11v5c3.8 3 8.2 3 12 0v-5M22 9v6"/></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6l8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-4.8"/></>,
    back: <><path d="M19 12H5"/><path d="m11 18-6-6 6-6"/></>,
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
  return Number.isNaN(date.getTime()) ? "Not specified" : date.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
};
const getInitials = value => String(value || "CO").trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();

function MetadataCard({ label, value, icon, featured = false }) {
  return (
    <div className={`min-w-0 rounded-2xl border p-4 sm:p-5 ${featured ? "border-blue-100 bg-blue-50/70" : "border-slate-200 bg-slate-50/70"}`}>
      <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] ${featured ? "text-[#174f97]" : "text-slate-600"}`}>
        <Icon type={icon} className="h-4 w-4 shrink-0" />{label}
      </div>
      <p className={`mt-3 break-words text-base font-extrabold sm:text-lg ${featured ? "text-[#174f97]" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}

export default function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isStudent, isCollegeAdmin } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [applyConfirmationOpen, setApplyConfirmationOpen] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    let active = true;
    if (!isAuthenticated) {
      setError("Sign in to view full job details and eligibility.");
      setLoading(false);
      setJob(null);
      return () => { active = false; };
    }

    setLoading(true);
    setError("");
    api.get(`/jobs/${jobId}`)
      .then(response => {
        if (active) setJob(response.data.job || response.data);
      })
      .catch(requestError => {
        if (active) setError(requestError.response?.data?.message || "We could not load this job posting.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    if (isStudent) {
      api.get("/applications/my?limit=1000")
        .then(response => {
          if (!active) return;
          const applications = response.data.applications || [];
          setAlreadyApplied(applications.some(application => {
            const linkedJob = application.job?._id || application.job;
            return linkedJob && String(linkedJob) === String(jobId);
          }));
        })
        .catch(() => {});
    } else {
      setAlreadyApplied(false);
    }

    return () => { active = false; };
  }, [jobId, isAuthenticated, isStudent]);

  const submitApplication = async () => {
    if (!job?._id || applying || alreadyApplied) return;
    try {
      setApplying(true);
      await api.post(`/applications/${job._id}`, {});
      setAlreadyApplied(true);
      setApplyConfirmationOpen(false);
      toast.success("Application submitted successfully.");
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Application failed. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <PageContainer className="!py-7 sm:!py-10"><div className="mx-auto max-w-6xl"><Card className="!p-6 sm:!p-9" aria-busy="true"><div className="animate-pulse space-y-5"><div className="h-4 w-36 rounded bg-slate-100"/><div className="h-9 w-3/5 rounded bg-slate-100"/><div className="h-4 w-2/5 rounded bg-slate-100"/><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="h-24 rounded-xl bg-slate-50"/><div className="h-24 rounded-xl bg-slate-50"/><div className="h-24 rounded-xl bg-slate-50"/><div className="h-24 rounded-xl bg-slate-50"/></div></div></Card></div></PageContainer>;
  }

  if (error || !job) {
    const verificationIssue = isStudent && user?.verificationStatus !== "verified";
    return <PageContainer className="!py-7 sm:!py-10"><div className="mx-auto max-w-3xl"><Card className="!p-7 text-center sm:!p-10"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-blue-100 bg-blue-50 text-[#245e9b]"><Icon type={verificationIssue ? "shield" : "building"} className="h-6 w-6"/></span><h1 className="mt-5 text-2xl font-extrabold text-slate-900">{!isAuthenticated ? "Sign in to view this opportunity" : verificationIssue ? "Verify your student account first" : "Job details unavailable"}</h1><p className="mx-auto mt-2 max-w-xl break-words text-sm leading-6 text-slate-600">{error || "This job posting may have been removed or you may not have access to it."}</p><div className="mt-6 flex flex-wrap justify-center gap-3">{!isAuthenticated ? <Button onClick={() => navigate("/login")}>Sign in to continue</Button> : verificationIssue ? <Button onClick={() => navigate("/profile")}>Review profile</Button> : null}<Button variant="secondary" onClick={() => navigate("/jobs")}><Icon type="back" className="h-4 w-4"/> Back to opportunities</Button></div></Card></div></PageContainer>;
  }

  const branches = Array.isArray(job.allowedBranches) ? job.allowedBranches.filter(Boolean) : [];
  const postedBy = job.createdBy?.name || "College placement team";
  const postedAt = formatDate(job.createdAt);
  const canApply = isAuthenticated && isStudent && user?.verificationStatus === "verified" && !alreadyApplied;

  return <PageContainer className="!py-7 sm:!py-10">
    <div className="mx-auto max-w-6xl min-w-0">
      <button type="button" onClick={() => navigate("/jobs")} className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-bold text-[#245e9b] transition hover:bg-blue-50 hover:text-[#173c63]"><Icon type="back" className="h-4 w-4"/> Back to opportunities</button>

      <header className="relative isolate mb-7 min-w-0 overflow-hidden rounded-[26px] bg-[linear-gradient(115deg,#071b3b_0%,#0b2e61_58%,#1555a5_100%)] p-6 text-white shadow-[0_18px_50px_rgba(13,54,111,.17)] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-16 -top-24 -z-10 h-64 w-64 rounded-full border border-white/15 shadow-[0_0_0_32px_rgba(255,255,255,.035),0_0_0_68px_rgba(255,255,255,.025)]" />
        <p className="text-xs font-extrabold uppercase tracking-[.2em] text-blue-200">Placement opportunity</p>
        <div className="mt-4 flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/20 bg-white/10 text-lg font-extrabold text-white">{getInitials(job.company)}</span>
            <div className="min-w-0"><h1 className="break-words text-3xl font-extrabold leading-tight tracking-[-.045em] text-white sm:text-4xl">{job.title || "Untitled role"}</h1><p className="mt-2 break-words text-base font-bold text-blue-100 sm:text-lg">{job.company || "Company not specified"}</p>{job.college?.name && <p className="mt-2 inline-flex max-w-full items-start gap-2 break-words text-sm text-blue-100/90"><Icon type="building" className="mt-0.5 h-4 w-4 shrink-0"/>{job.college.name}</p>}</div>
          </div>
          {alreadyApplied && <span className="inline-flex w-fit shrink-0 items-center rounded-full border border-emerald-200/30 bg-emerald-300/15 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-emerald-100">Application submitted</span>}
        </div>
        <p className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-blue-100/85"><span>Posted {postedAt}</span><span>Posted by {postedBy}</span></p>
      </header>

      <section className="mb-7 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Job summary">
        <MetadataCard label="Location" value={job.location || "Not specified"} icon="pin" />
        <MetadataCard label="Annual salary" value={formatSalary(job.salary)} icon="money" featured />
        <MetadataCard label="Minimum CGPA" value={Number(job.minCgpa) > 0 ? `${job.minCgpa} / 10` : "No minimum"} icon="graduation" />
        <MetadataCard label="Application deadline" value={formatDate(job.deadline)} icon="calendar" />
      </section>

      <div className="portal-job-details-grid grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(250px,.8fr)_minmax(0,1.65fr)]">
        <div className="portal-job-eligibility-column grid min-w-0 gap-5">
          <Card className="portal-job-eligibility-card min-w-0 !p-5 sm:!p-6">
            <h2 className="text-lg font-extrabold text-slate-900">Eligibility</h2>
            <div className="mt-4 divide-y divide-slate-100">
              <div className="py-3"><p className="text-xs font-semibold text-slate-500">Minimum CGPA</p><p className="mt-1 break-words text-sm font-bold text-slate-800">{Number(job.minCgpa) > 0 ? `${job.minCgpa} out of 10` : "No minimum CGPA specified"}</p></div>
              <div className="py-3"><p className="text-xs font-semibold text-slate-500">Eligible branches</p>{branches.length ? <div className="mt-2 flex flex-wrap gap-2">{branches.map(branch => <span key={branch} className="max-w-full break-words rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">{branch}</span>)}</div> : <p className="mt-1 text-sm font-bold text-slate-800">All branches</p>}</div>
              <div className="py-3"><p className="text-xs font-semibold text-slate-500">Deadline</p><p className="mt-1 break-words text-sm font-bold text-slate-800">{formatDate(job.deadline)}</p></div>
            </div>
          </Card>
          <Card className="min-w-0 !p-5 sm:!p-6">
            <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#245e9b]"><Icon type="building" className="h-5 w-5"/></span><div className="min-w-0"><h2 className="text-base font-extrabold text-slate-900">Posting information</h2><p className="mt-1 break-words text-sm leading-6 text-slate-600">{job.college?.name || "Your college placement portal"}</p><p className="mt-2 text-xs leading-5 text-slate-500">For questions about this opportunity, contact your college placement team.</p></div></div>
          </Card>
        </div>
        <Card className="portal-job-description-card min-w-0 !p-5 sm:!p-7">
          <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#365e85]">Role overview</p>
          <h2 className="mt-2 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">Job description</h2>
          <div className="mt-5 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{job.description || "The employer has not provided a detailed description for this role."}</div>
        </Card>
      </div>

      <section className="mt-7 min-w-0 rounded-[24px] border border-blue-100 bg-[linear-gradient(120deg,#eef5ff_0%,#ffffff_65%,#f7faff_100%)] p-5 shadow-[0_8px_24px_rgba(18,57,109,.04)] sm:p-7 lg:p-8" aria-labelledby="application-action-title">
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-blue-100 bg-white text-[#245e9b]"><Icon type="shield" className="h-5 w-5"/></span><div className="min-w-0"><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#365e85]">Next step</p><h2 id="application-action-title" className="mt-1 break-words text-xl font-extrabold text-slate-900">{alreadyApplied ? "You have applied for this role" : isStudent ? "Ready to apply?" : "Review the full role details"}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{alreadyApplied ? "Your application has been submitted. You can follow its progress from My applications." : isStudent ? "Check your saved profile and resume, then submit your application when you're ready." : "Students can submit applications from this page after reviewing the role and eligibility criteria."}</p></div></div>
          <div className="flex min-w-0 shrink-0 flex-col gap-2 sm:min-w-[190px]">
            {alreadyApplied ? <Button onClick={() => navigate("/my-applications")} className="w-full justify-center">View my applications <Icon type="arrow" className="h-4 w-4"/></Button>
              : canApply ? <Button onClick={() => setApplyConfirmationOpen(true)} className="w-full justify-center">Submit application <Icon type="arrow" className="h-4 w-4"/></Button>
              : isStudent ? <Button variant="secondary" onClick={() => navigate("/profile")} className="w-full justify-center">Review profile</Button>
              : isCollegeAdmin ? <Button variant="secondary" onClick={() => navigate(`/admin/jobs/${job._id}/applicants`)} className="w-full justify-center">View applicants</Button>
              : <Button variant="secondary" onClick={() => navigate("/jobs")} className="w-full justify-center">Back to opportunities</Button>}
            {isStudent && !alreadyApplied && <p className="text-center text-xs leading-5 text-slate-500">Applications use the details saved in your student profile.</p>}
          </div>
        </div>
      </section>
    </div>

    <ConfirmationModal
      open={applyConfirmationOpen}
      title="Submit this application?"
      message={`Apply for ${job.title || "this role"}${job.company ? ` at ${job.company}` : ""}? Your saved student profile will be associated with this application.`}
      confirmText="Submit application"
      confirmVariant="primary"
      loading={applying}
      onCancel={() => { if (!applying) setApplyConfirmationOpen(false); }}
      onConfirm={submitApplication}
    />
  </PageContainer>;
}
