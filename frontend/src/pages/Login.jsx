import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Mark() { return <Link to="/" className="auth-brand" aria-label="Placement Portal home"><span className="auth-brand-mark">P</span><span>Placement<span>Portal</span><small>CAMPUS TO CAREER</small></span></Link>; }
function SparkIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm7 13 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/></svg>; }
export default function Login() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [loading, setLoading] = useState(false); const [isForgotView, setIsForgotView] = useState(false); const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); const { login } = useAuth();
  const handleSubmit = async event => {
    event.preventDefault();
    try {
      setLoading(true);
      if (isForgotView) { const result = await api.post("/auth/forgot-password", { email }); toast.success(result.data.message || "If the account exists, a reset link will be sent."); setIsForgotView(false); setPassword(""); return; }
      await api.post("/auth/login", { email, password });
      const user = await login();
      if (!user) throw new Error("The server created a session but the current user could not be loaded.");
      toast.success("Login successful.");
      navigate(user.role === "super_admin" ? "/super-admin" : user.role === "college_admin" ? "/admin" : "/jobs", { replace: true });
    } catch (error) { toast.error(error.response?.data?.message || error.message || "Login failed."); }
    finally { setLoading(false); }
  };
  return <main className="auth-page">
    <aside className="auth-showcase">
      <div className="auth-showcase-grid" aria-hidden="true"/><div className="auth-showcase-orb auth-showcase-orb-a"/><div className="auth-showcase-orb auth-showcase-orb-b"/>
      <div className="auth-showcase-content"><Mark/><div className="auth-showcase-copy"><span className="auth-kicker"><SparkIcon/> YOUR NEXT CHAPTER STARTS HERE</span><h1>Make your ambition <span>the next big thing.</span></h1><p>One thoughtful step at a time. Find relevant opportunities, build your profile, and move forward with confidence.</p>
        <div className="auth-points"><div><span>01</span><p><strong>Opportunities that fit</strong><small>Explore roles aligned with your campus and profile.</small></p></div><div><span>02</span><p><strong>Your journey, organized</strong><small>Keep your applications and progress in one place.</small></p></div><div><span>03</span><p><strong>Built around your campus</strong><small>A clearer path from student life to career.</small></p></div></div>
      </div><div className="auth-showcase-footer"><span>PLACEMENT PORTAL</span><span>Campus to career, together.</span></div></div>
    </aside>
    <section className="auth-form-side"><div className="auth-mobile-brand"><Mark/></div><div className="auth-form-wrap">
      <div className="auth-form-heading"><span className="auth-step-label">{isForgotView ? "ACCOUNT RECOVERY" : "WELCOME BACK"}</span><h2>{isForgotView ? "Reset your password" : "Sign in to your account"}</h2><p>{isForgotView ? "Enter the email linked to your account and we’ll send recovery instructions if it exists." : "Your next opportunity is only a few steps away."}</p></div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="auth-field"><span>Email address</span><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@college.edu" required autoComplete="email" autoFocus /></label>
        {!isForgotView && <label className="auth-field"><span>Password</span><div className="auth-password-wrap"><input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required autoComplete="current-password"/><button type="button" className="auth-show-password" onClick={() => setShowPassword(v => !v)}>{showPassword ? "Hide" : "Show"}</button></div></label>}
        {!isForgotView && <div className="auth-inline-row"><span className="auth-secure-note"><span/> Secure sign in</span><button type="button" className="auth-text-button" onClick={() => setIsForgotView(true)}>Forgot password?</button></div>}
        <button className="auth-submit" type="submit" disabled={loading}>{loading ? "Please wait…" : isForgotView ? "Send recovery link" : "Sign in"}<span aria-hidden="true">→</span></button>
        {isForgotView && <button type="button" className="auth-back-button" onClick={() => setIsForgotView(false)}>← Back to sign in</button>}
      </form>
      {!isForgotView && <p className="auth-switch-copy">New to Placement Portal? <Link to="/register">Create a student account <span>↗</span></Link></p>}
      <div className="auth-form-foot"><span>Protected campus access</span><span>·</span><Link to="/college-onboarding">College administrator?</Link></div>
    </div></section>
  </main>;
}
