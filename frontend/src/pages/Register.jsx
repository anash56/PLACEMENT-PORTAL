import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

function Mark() { return <Link to="/" className="auth-brand" aria-label="Placement Portal home"><span className="auth-brand-mark">P</span><span>Placement<span>Portal</span><small>CAMPUS TO CAREER</small></span></Link>; }
function CheckIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" /></svg>; }
export default function Register() {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [showPassword, setShowPassword] = useState(false);
  const [collegeQuery, setCollegeQuery] = useState("");
  const [colleges, setColleges] = useState([]);
  const [collegeResultsQuery, setCollegeResultsQuery] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [idCardBase64, setIdCardBase64] = useState(""); const [idCardName, setIdCardName] = useState(""); const [loading, setLoading] = useState(false); const [searching, setSearching] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const query = collegeQuery.trim();

    if (query.length < 2 || collegeId) {
      return;
    }

    let active = true;

    const timer = setTimeout(async () => {
      try {
        setSearching(true);

        const response = await api.get(
          `/colleges/search?q=${encodeURIComponent(query)}`
        );

        if (active) {
          setColleges(response.data.colleges || []);
          setCollegeResultsQuery(query);
        }
      } catch {
        if (active) {
          setColleges([]);
          setCollegeResultsQuery(query);
        }
      } finally {
        if (active) {
          setSearching(false);
        }
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [collegeQuery, collegeId]);
  const handleIdCard = event => { const file = event.target.files?.[0]; setIdCardBase64(""); setIdCardName(""); if (!file) return; if (!(["image/jpeg", "image/png", "application/pdf"].includes(file.type)) || file.size > 5 * 1024 * 1024) { toast.error("Choose a JPG, PNG, or PDF file up to 5 MB."); event.target.value = ""; return; } const reader = new FileReader(); reader.onload = () => { setIdCardBase64(String(reader.result)); setIdCardName(file.name); }; reader.onerror = () => toast.error("Could not read the selected file."); reader.readAsDataURL(file); };
  const passwordValid = password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
  const handleSubmit = async event => { event.preventDefault(); if (!collegeId) return toast.error("Search and select an approved college."); if (!idCardBase64) return toast.error("Upload your college ID card."); if (!passwordValid) return toast.error("Password must include uppercase, lowercase, number, special character, and be at least 8 characters."); try { setLoading(true); await api.post("/auth/register", { name, email, password, collegeId, collegeIdCardBase64: idCardBase64 }); toast.success("Account created. Your college affiliation is pending verification."); navigate("/login"); } catch (error) { toast.error(error.response?.data?.message || "Registration failed."); } finally { setLoading(false); } };
  return <main className="auth-page auth-register-page">
    <aside className="auth-showcase auth-register-showcase"><div className="auth-showcase-grid" aria-hidden="true" /><div className="auth-showcase-orb auth-showcase-orb-a" /><div className="auth-showcase-orb auth-showcase-orb-b" /><div className="auth-showcase-content"><Mark /><div className="auth-showcase-copy"><span className="auth-kicker"><span className="auth-kicker-dot" /> START YOUR JOURNEY</span><h1>Your future is <span>worth showing up for.</span></h1><p>Create your student account to keep your academic profile, campus opportunities, and applications connected.</p><div className="auth-register-feature"><span><CheckIcon /></span><div><strong>A profile that grows with you</strong><p>Keep your skills, academic details and resume together.</p></div></div><div className="auth-register-feature"><span><CheckIcon /></span><div><strong>Relevant campus opportunities</strong><p>Discover roles after your student identity is verified.</p></div></div><div className="auth-register-feature"><span><CheckIcon /></span><div><strong>Clearer application tracking</strong><p>See your application journey in one organized place.</p></div></div></div><div className="auth-showcase-footer"><span>PLACEMENT PORTAL</span><span>Your campus. Your career.</span></div></div></aside>
    <section className="auth-form-side auth-register-form-side"><div className="auth-mobile-brand"><Mark /></div><div className="auth-form-wrap auth-register-form-wrap"><div className="auth-form-heading"><span className="auth-step-label">STUDENT REGISTRATION</span><h2>Create your account</h2><p>It starts with a few details. You can complete the rest of your profile after signing in.</p></div>
      <form className="auth-form auth-register-form" onSubmit={handleSubmit}>
        <label className="auth-field"><span>Full name</span><input value={name} onChange={e => setName(e.target.value)} placeholder="As shown on your college ID" required autoComplete="name" /></label>
        <label className="auth-field"><span>College email address</span><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@college.edu" required autoComplete="email" /></label>
        <label className="auth-field"><span>Password</span><div className="auth-password-wrap"><input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a strong password" required autoComplete="new-password" /><button type="button" className="auth-show-password" onClick={() => setShowPassword(v => !v)}>{showPassword ? "Hide" : "Show"}</button></div></label>
        <div className="auth-password-rules"><span className={password.length >= 8 ? "rule-met" : ""}><i />{"At least 8 characters"}</span><span className={/[A-Z]/.test(password) ? "rule-met" : ""}><i />One uppercase letter</span><span className={/[a-z]/.test(password) ? "rule-met" : ""}><i />One lowercase letter</span><span className={/\d/.test(password) ? "rule-met" : ""}><i />One number</span><span className={/[^A-Za-z0-9]/.test(password) ? "rule-met" : ""}><i />One special character</span></div>
        <div className="auth-field auth-college-field"><span>Choose your approved college</span><div className="auth-college-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" /><path strokeLinecap="round" d="m16 16 4.5 4.5" /></svg><input value={collegeQuery} onChange={e => { setCollegeQuery(e.target.value); setCollegeId(""); }} placeholder="Search by college name…" autoComplete="off" required aria-expanded={Boolean(!collegeId && collegeQuery.trim().length >= 2)} />{searching && <span className="auth-search-spinner" />}</div>
          {collegeId ? <div className="auth-selected-college"><CheckIcon /> {collegeQuery}<button type="button" onClick={() => { setCollegeId(""); setCollegeQuery(""); }}>Change</button></div> : collegeQuery.trim().length >= 2 &&
            collegeResultsQuery === collegeQuery.trim() && (
              <div className="auth-college-results">{searching ? <p>Searching approved colleges…</p> : colleges.length ? colleges.map(college => <button type="button" key={college._id} onClick={() => { setCollegeId(college._id); setCollegeQuery(college.name); setColleges([]); }}><span className="auth-college-result-icon">{(college.name || "C").charAt(0).toUpperCase()}</span><span>{college.name}<small>Approved institution</small></span><b>→</b></button>) : <p>No approved college found. Check the name or ask your college to register.</p>}</div>)}
          <small className="auth-field-hint">Only approved colleges can be selected.</small>
        </div>
        <div className="auth-upload-field"><div className="auth-upload-heading"><span>Student ID card</span><small>Required for verification</small></div><label className={`auth-upload-drop ${idCardName ? "auth-upload-selected" : ""}`}><input type="file" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" onChange={handleIdCard} required={!idCardBase64} /><span className="auth-upload-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 15v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4" /></svg></span><span className="auth-upload-copy"><strong>{idCardName || "Upload your college ID"}</strong><small>{idCardName ? "Ready to submit" : "JPG, PNG or PDF · Maximum 5 MB"}</small></span><span className="auth-upload-action">{idCardName ? "Change file" : "Browse"}</span></label><p className="auth-field-hint">Your document is used to verify your college affiliation.</p></div>
        <button className="auth-submit" type="submit" disabled={loading}>{loading ? "Creating account…" : "Create student account"}<span aria-hidden="true">→</span></button><p className="auth-terms-note">By creating an account, you confirm that the details you provide are accurate.</p>
      </form><p className="auth-switch-copy">Already have an account? <Link to="/login">Sign in <span>↗</span></Link></p><div className="auth-form-foot"><span>Student access</span><span>·</span><Link to="/college-onboarding">Register a college instead</Link></div>
    </div></section>
  </main>;
}
