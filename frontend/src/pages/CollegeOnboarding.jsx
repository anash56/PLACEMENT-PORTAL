import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import PageContainer from "../components/ui/PageContainer";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/TextArea";

const initial = { name: "", contactPerson: "", contactDesignation: "", contactEmail: "", contactPhone: "", website: "", address: "" };
const Icon = ({ type, className = "h-5 w-5" }) => {
  const paths = {
    building: <><path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M9 7h2m2 0h2M9 11h2m2 0h2M9 15h2m2 0h2M10 21v-3h4v3"/></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6l8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-4.8"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5v1"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  };
  return <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[type]}</svg>;
};

export default function CollegeOnboarding() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const set = e => setForm(previous => ({ ...previous, [e.target.name]: e.target.value }));
  const submit = async e => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/colleges/requests", form);
      setDone(true);
      toast.success("College request submitted.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not submit request.");
    } finally { setLoading(false); }
  };

  return <PageContainer className="!px-4 !py-8 sm:!py-12">
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-blue-700"><span className="h-2 w-2 rounded-full bg-blue-600" />Institution onboarding</div>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-700"><span aria-hidden="true">←</span> Back to home</Link>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-[0_24px_80px_rgba(18,57,109,0.09)]">
        <div className="grid lg:grid-cols-[.84fr_1.16fr]">
          <aside className="relative isolate overflow-hidden bg-[linear-gradient(145deg,#071b3b_0%,#0b2e61_58%,#1456a3_100%)] p-7 text-white sm:p-10 lg:p-11">
            <div className="pointer-events-none absolute -right-28 -top-28 -z-10 h-72 w-72 rounded-full border border-white/15 shadow-[0_0_0_35px_rgba(255,255,255,.035),0_0_0_75px_rgba(255,255,255,.025)]" />
            <div className="mb-10 grid h-14 w-14 place-items-center rounded-2xl border border-white/15 bg-white/10 text-blue-100 shadow-lg"><Icon type="building" className="h-7 w-7" /></div>
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-blue-200">For colleges & institutions</p>
            <h1 className="mt-4 max-w-lg text-3xl font-extrabold leading-[1.12] tracking-[-.045em] sm:text-4xl">Bring your campus placement journey together.</h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-blue-100/85">Register your institution to connect students with relevant opportunities and manage recruitment through a trusted college network.</p>
            <div className="mt-9 space-y-5">
              <div className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-blue-100"><Icon type="shield" className="h-[18px] w-[18px]" /></span><div><h2 className="text-sm font-bold">Verified institution network</h2><p className="mt-1 text-xs leading-5 text-blue-100/75">Each request is reviewed before the college becomes available on the platform.</p></div></div>
              <div className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-blue-100"><Icon type="users" className="h-[18px] w-[18px]" /></span><div><h2 className="text-sm font-bold">One connected placement workflow</h2><p className="mt-1 text-xs leading-5 text-blue-100/75">Help students discover eligible jobs and make recruitment easier to coordinate.</p></div></div>
            </div>
            <div className="mt-10 rounded-2xl border border-white/15 bg-white/[.07] p-4">
              <div className="flex items-start gap-3"><Icon type="lock" className="mt-0.5 h-4 w-4 shrink-0 text-blue-200" /><p className="text-xs leading-5 text-blue-100/80">Your request stays pending until a Super Admin reviews it. The submission does not automatically approve or activate your college.</p></div>
            </div>
            <div className="pointer-events-none absolute -bottom-20 -left-16 -z-10 h-56 w-56 rounded-full bg-blue-400/15 blur-3xl" />
          </aside>

          <section className="p-6 sm:p-10 lg:p-11">
            {done ? <div className="flex min-h-full flex-col justify-center py-4 motion-rise">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"><Icon type="check" className="h-8 w-8" /></div>
              <p className="mt-7 text-xs font-extrabold uppercase tracking-[.18em] text-emerald-700">Successfully submitted</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-.04em] text-slate-900">Request received.</h2>
              <p className="mt-3 max-w-lg text-sm leading-7 text-slate-600">Thanks for registering <strong className="text-slate-800">{form.name}</strong>. Your details have been sent for review. The college remains pending until the Super Admin completes verification.</p>
              <div className="mt-7 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5"><p className="text-sm font-bold text-emerald-900">What happens next?</p><p className="mt-1 text-sm leading-6 text-emerald-800/80">The platform team will review your institution request. Please make sure the official contact details you supplied are accurate.</p></div>
              <div className="mt-8 flex flex-wrap gap-3"><Button onClick={() => { setForm(initial); setDone(false); }} className="inline-flex items-center gap-2">Submit another request <Icon type="arrow" className="h-4 w-4" /></Button><Link to="/" className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Return home</Link></div>
            </div> : <>
              <div className="mb-8">
                <p className="text-xs font-extrabold uppercase tracking-[.18em] text-blue-700">Get started</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-[-.045em] text-slate-900">College onboarding request</h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">Share your institution and authorized contact details. Fields marked <span className="font-bold text-blue-700">*</span> are required.</p>
              </div>
              <form onSubmit={submit} className="space-y-7">
                <fieldset className="space-y-4">
                  <legend className="mb-4 flex items-center gap-2 text-sm font-extrabold text-slate-800"><span className="grid h-6 w-6 place-items-center rounded-lg bg-blue-50 text-xs text-blue-700">01</span> Institution details</legend>
                  <Input label="Official college / institution name *" name="name" autoComplete="organization" value={form.name} onChange={set} required placeholder="e.g. L.D. College of Engineering" />
                  <Input label="Institution website (optional)" type="url" name="website" autoComplete="url" placeholder="https://college.edu.in" value={form.website} onChange={set} />
                  <Textarea label="Full institutional address *" name="address" autoComplete="street-address" value={form.address} onChange={set} rows={3} required placeholder="Street, area, city, state and postal code" />
                </fieldset>
                <div className="h-px bg-slate-100" />
                <fieldset className="space-y-4">
                  <legend className="mb-4 flex items-center gap-2 text-sm font-extrabold text-slate-800"><span className="grid h-6 w-6 place-items-center rounded-lg bg-blue-50 text-xs text-blue-700">02</span> Authorized contact</legend>
                  <div className="grid gap-4 sm:grid-cols-2"><Input label="Contact person's full name *" name="contactPerson" autoComplete="name" value={form.contactPerson} onChange={set} required placeholder="Full name" /><Input label="Designation" name="contactDesignation" autoComplete="organization-title" value={form.contactDesignation} onChange={set} placeholder="e.g. Placement Officer" /></div>
                  <div className="grid gap-4 sm:grid-cols-2"><Input label="Official email address *" type="email" name="contactEmail" autoComplete="email" value={form.contactEmail} onChange={set} required placeholder="name@college.edu.in" /><Input label="Contact phone number *" type="tel" name="contactPhone" autoComplete="tel" value={form.contactPhone} onChange={set} required placeholder="Include area/country code" /></div>
                </fieldset>
                <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4"><p className="text-xs leading-5 text-blue-900/80">Please use an official institutional email and working phone number so the verification team can contact your college if more information is needed.</p></div>
                <Button type="submit" className="!flex min-h-12 w-full items-center justify-center gap-2 !rounded-xl !px-5 text-sm" disabled={loading}>{loading ? "Submitting request…" : <>Submit for verification <Icon type="arrow" className="h-4 w-4" /></>}</Button>
                <p className="text-center text-xs leading-5 text-slate-400">By submitting, you confirm these details are accurate and authorized for institutional registration.</p>
              </form>
            </>}
          </section>
        </div>
      </div>
      <p className="mt-5 text-center text-xs text-slate-400">Need help? Make sure all institutional contact details are correct before submitting.</p>
    </div>
  </PageContainer>;
}
