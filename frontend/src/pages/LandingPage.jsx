import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Arrow = ({ className = "h-4 w-4" }) => <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" /></svg>;
const Icon = ({ type, className = "h-5 w-5" }) => {
  const paths = {
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></>,
    check: <><path d="m5 12 4 4L19 6"/></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6l8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-4.8"/></>,
    compass: <><circle cx="12" cy="12" r="9"/><path d="m15.8 8.2-2.2 5.4-5.4 2.2 2.2-5.4 5.4-2.2Z"/></>,
    chart: <><path d="M4 19V5m0 14h16"/><path d="m7 15 4-4 3 2 5-6"/></>,
    users: <><circle cx="9" cy="8" r="3.2"/><path d="M3 20v-1.4A4.6 4.6 0 0 1 7.6 14h2.8a4.6 4.6 0 0 1 4.6 4.6V20M16 5.2a3.2 3.2 0 0 1 0 6.2m2.2 2.8A4.6 4.6 0 0 1 22 18.6V20"/></>,
    building: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h2m4 0h2M8 11h2m4 0h2M8 15h2m4 0h2M10 21v-3h4v3"/></>,
    spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/></>,
  };
  return <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[type] || paths.spark}</svg>;
};

const featuredCompanies = ["Google", "Microsoft", "Adobe", "Infosys", "TCS"];
const benefits = [
  { icon: "search", title: "Opportunities that fit", description: "Discover openings aligned with your college, branch and academic eligibility—not an endless list of irrelevant roles." },
  { icon: "shield", title: "Verified campus access", description: "A college-aware experience helps students find relevant drives after their student identity is verified." },
  { icon: "chart", title: "A clearer application journey", description: "Keep your profile, resume and application progress together, from the first search to the next opportunity." },
];

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const primaryPath = isAuthenticated ? (user?.role === "super_admin" ? "/super-admin" : user?.role === "college_admin" ? "/admin" : "/jobs") : "/register";

  return <main className="landing-root overflow-hidden bg-white">
    <section className="landing-hero relative isolate overflow-hidden">
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-orb hero-orb-one" aria-hidden="true" />
      <div className="hero-orb hero-orb-two" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[1.04fr_.96fr] lg:gap-10 lg:px-10 lg:pb-28 lg:pt-24">
        <div className="motion-rise relative z-10 max-w-2xl">
          <div className="landing-eyebrow"><span className="eyebrow-pulse" /> YOUR NEXT CHAPTER STARTS HERE</div>
          <h1 className="landing-title mt-7">Talent meets <span className="title-highlight">opportunity.</span></h1>
          <p className="landing-subtitle mt-6 max-w-xl">A smarter campus placement experience—bringing students, colleges and career-defining opportunities together in one place.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link className="landing-primary-cta" to={primaryPath}>{isAuthenticated ? "Go to your dashboard" : "Start your journey"}<Arrow className="h-5 w-5" /></Link>
            <Link className="landing-secondary-cta" to="/jobs">Explore opportunities<Arrow className="h-4 w-4" /></Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-blue-100/90">
            <span className="inline-flex items-center gap-2"><Icon type="check" className="h-4 w-4 text-sky-300"/> College-specific opportunities</span>
            <span className="inline-flex items-center gap-2"><Icon type="check" className="h-4 w-4 text-sky-300"/> Verified student profiles</span>
          </div>
        </div>

        <div className="hero-visual motion-rise" style={{ animationDelay: "90ms" }} aria-label="Illustration of a student exploring placement opportunities">
          <div className="visual-glow" />
          <div className="visual-window">
            <div className="visual-window-top"><div className="visual-dots"><i/><i/><i/></div><span>CAREER OVERVIEW</span><span className="visual-live"><b/> LIVE</span></div>
            <div className="visual-welcome"><div><p>YOUR CAREER SPACE</p><h2>Make your next move.</h2><span>Opportunities built around you.</span></div><div className="avatar-stack"><span>AK</span><span>NP</span><span>+</span></div></div>
            <div className="visual-stats"><div><span>Profile strength</span><strong>86%</strong><div className="tiny-track"><i style={{ width: "86%" }}/></div></div><div><span>Career matches</span><strong>12 <small>new</small></strong><div className="tiny-bars"><i/><i/><i/><i/><i/><i/><i/></div></div></div>
            <div className="visual-section-title"><strong>Featured opportunities</strong><span>Curated for you</span></div>
            <div className="visual-job"><div className="company-mark company-mark-blue">M</div><div className="visual-job-info"><strong>Software Engineer</strong><span>Microsoft · Full-time</span></div><span className="job-arrow"><Arrow/></span></div>
            <div className="visual-job"><div className="company-mark company-mark-purple">A</div><div className="visual-job-info"><strong>Graduate Developer</strong><span>Adobe · Campus hiring</span></div><span className="job-arrow"><Arrow/></span></div>
            <div className="visual-job"><div className="company-mark company-mark-green">T</div><div className="visual-job-info"><strong>Associate Engineer</strong><span>TCS · Entry level</span></div><span className="job-arrow"><Arrow/></span></div>
            <div className="visual-window-footer"><span><Icon type="shield" className="h-4 w-4"/> Your profile. Your journey.</span><span className="footer-spark"><Icon type="spark" className="h-4 w-4"/></span></div>
          </div>
          <div className="floating-note note-top"><span className="note-icon"><Icon type="check"/></span><span><strong>Profile verified</strong><small>Ready for opportunities</small></span><span className="note-check">✓</span></div>
          <div className="floating-note note-bottom"><span className="note-chart"><Icon type="chart" className="h-5 w-5"/></span><span><strong>Move forward</strong><small>One application at a time</small></span></div>
        </div>
      </div>
      <div className="hero-bottom-line" aria-hidden="true" />
    </section>

    <section className="trust-section border-b border-slate-100 bg-white px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 sm:flex-row">
        <p className="trust-caption">BUILT FOR THE CAMPUS-TO-CAREER JOURNEY</p>
        <div className="company-wordmarks" aria-label="Examples of companies students aspire to join">{featuredCompanies.map((company, i) => <span key={company} className={`wordmark wordmark-${i}`}>{company}</span>)}</div>
      </div>
      <p className="mx-auto mt-3 max-w-7xl text-center text-xs text-slate-400 sm:text-right">Illustrative company names, not claimed hiring partners.</p>
    </section>

    <section className="landing-section bg-white px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="section-heading mx-auto max-w-3xl text-center"><span className="section-kicker">A BETTER WAY TO GET PLACED</span><h2>Less searching. <span>More moving forward.</span></h2><p>Everything you need for a more focused placement experience, designed around how campus hiring really works.</p></div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">{benefits.map((item, index) => <article className="benefit-card" key={item.title}><div className={`benefit-icon benefit-icon-${index}`}><Icon type={item.icon} className="h-6 w-6"/></div><div className="benefit-number">0{index + 1}</div><h3>{item.title}</h3><p>{item.description}</p><span className="benefit-accent"/></article>)}</div>
      </div>
    </section>

    <section className="process-section px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[.85fr_1.15fr]">
        <div><span className="section-kicker">YOUR PATH, MADE CLEAR</span><h2 className="process-title mt-4">From campus to career, <span>step by step.</span></h2><p className="mt-5 max-w-lg text-base leading-8 text-slate-600">Spend less time figuring out where to start and more time preparing for the opportunity that is right for you.</p><Link to={isAuthenticated ? "/profile" : "/register"} className="text-link mt-7">{isAuthenticated ? "Review your profile" : "Build your student profile"}<Arrow/></Link></div>
        <div className="process-list"><div className="process-line"/><div className="process-step"><div className="process-step-icon"><Icon type="users"/></div><div><span>STEP 01</span><h3>Create your profile</h3><p>Add your academic details, skills and resume in one place.</p></div><span className="process-state">Your foundation</span></div><div className="process-step"><div className="process-step-icon"><Icon type="shield"/></div><div><span>STEP 02</span><h3>Verify your student identity</h3><p>Connect with your college and complete the verification process.</p></div><span className="process-state">Trusted access</span></div><div className="process-step"><div className="process-step-icon"><Icon type="compass"/></div><div><span>STEP 03</span><h3>Explore eligible opportunities</h3><p>Find campus roles that fit your academic profile and interests.</p></div><span className="process-state">Take action</span></div><div className="process-step"><div className="process-step-icon"><Icon type="chart"/></div><div><span>STEP 04</span><h3>Track your progress</h3><p>Keep your applications and updates organized in your account.</p></div><span className="process-state">Move ahead</span></div></div>
      </div>
    </section>

    <section className="audience-section bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-7xl"><div className="section-heading max-w-2xl"><span className="section-kicker">ONE PLATFORM, CONNECTED CAMPUSES</span><h2>Designed for every side of <span>placements.</span></h2><p>A shared destination with clear, role-appropriate workflows for the people who make campus hiring happen.</p></div>
        <div className="mt-10 grid gap-5 md:grid-cols-2"><article className="audience-card student-audience"><div className="audience-icon"><Icon type="users" className="h-6 w-6"/></div><span className="audience-label">FOR STUDENTS</span><h3>Your next opportunity deserves a plan.</h3><p>Maintain your profile, find college-relevant jobs and stay on top of your applications.</p><Link to={isAuthenticated ? "/jobs" : "/register"}>{isAuthenticated ? "Explore jobs" : "Create an account"}<Arrow/></Link><div className="audience-decoration decoration-student" aria-hidden="true"><span/><span/><span/></div></article>
        <article className="audience-card college-audience"><div className="audience-icon"><Icon type="building" className="h-6 w-6"/></div><span className="audience-label">FOR COLLEGES</span><h3>Bring your placement workflow together.</h3><p>Manage campus opportunities and student verification through a dedicated college-admin experience.</p><Link to="/college-onboarding">Register your institution<Arrow/></Link><div className="audience-decoration decoration-college" aria-hidden="true"><span/><span/><span/></div></article></div>
      </div>
    </section>

    <section className="landing-cta-wrap px-5 py-16 sm:px-8 lg:px-10 lg:py-20"><div className="landing-final-cta mx-auto max-w-7xl"><div className="cta-orb"/><div className="relative z-10 max-w-2xl"><span className="section-kicker cta-kicker">THE NEXT STEP IS YOURS</span><h2>Let your potential <span>meet its opportunity.</span></h2><p>Start with your profile. Keep your goals in sight. Make every application count.</p></div><div className="relative z-10 flex flex-col gap-3 sm:flex-row lg:flex-col"><Link className="cta-white-button" to={primaryPath}>{isAuthenticated ? "Open your dashboard" : "Get started for free"}<Arrow/></Link><Link className="cta-outline-button" to="/jobs">Browse opportunities</Link></div></div></section>

    <footer className="landing-footer px-5 py-8 sm:px-8 lg:px-10"><div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><Link to="/" className="footer-brand"><span className="brand-mark">P</span><span>Placement<span>Portal</span><small>YOUR CAMPUS. YOUR CAREER.</small></span></Link><div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500"><Link to="/jobs">Opportunities</Link><Link to="/college-onboarding">For Colleges</Link><Link to="/login">Sign in</Link><Link to="/register">Student registration</Link></div><p className="text-xs text-slate-400">© {new Date().getFullYear()} Placement Portal</p></div></footer>
  </main>;
}
