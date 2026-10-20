import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import PageContainer from "../components/ui/PageContainer";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

function ShieldMark() {
    return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-7 w-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3 20 6v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6l8-3Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.5 12 2.2 2.2 4.8-4.8" />
    </svg>;
}

export default function AcceptInvitation() {
    const [params] = useSearchParams();
    const token = params.get("token") || "";
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const submit = async event => {
        event.preventDefault();
        setErrorMessage("");
        if (password !== confirmPassword) {
            setErrorMessage("Your passwords do not match.");
            return;
        }

        try {
            setLoading(true);
            await api.post("/colleges/invitations/accept", { token, name: name.trim(), password });
            toast.success("College Admin account created. Please sign in.");
            navigate("/login", { replace: true });
        } catch (error) {
            const message = error.response?.data?.message || "We could not complete account setup. The invitation may have expired or already been used.";
            setErrorMessage(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return <PageContainer className="!bg-slate-50 !px-4 !py-10 sm:!py-14">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-[0_24px_80px_rgba(18,57,109,0.09)]">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
                <aside className="relative isolate overflow-hidden bg-[linear-gradient(145deg,#071b3b_0%,#0b2e61_58%,#1456a3_100%)] p-7 text-white sm:p-10">
                    <div className="pointer-events-none absolute -right-20 -top-20 -z-10 h-56 w-56 rounded-full border border-white/15 shadow-[0_0_0_30px_rgba(255,255,255,.035),0_0_0_60px_rgba(255,255,255,.025)]" />
                    <Link to="/" className="inline-flex items-center gap-3" aria-label="Placement Portal home">
                        <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/15 bg-white/10 text-blue-100">P</span>
                        <span className="text-lg font-extrabold tracking-tight">Placement<span className="text-blue-200">Portal</span><small className="mt-0.5 block text-[9px] font-bold tracking-[.2em] text-blue-200">CAMPUS TO CAREER</small></span>
                    </Link>
                    <div className="mt-12 grid h-14 w-14 place-items-center rounded-2xl border border-white/15 bg-white/10 text-blue-100"><ShieldMark /></div>
                    <p className="mt-8 text-xs font-extrabold uppercase tracking-[.2em] text-blue-200">Secure administrator setup</p>
                    <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-.04em] sm:text-4xl">Your campus workspace starts here.</h1>
                    <p className="mt-4 max-w-md text-sm leading-7 text-blue-100/85">Create the account associated with your institution’s invitation. Access is tied to the approved college on the invitation, not selected from the form.</p>
                    <div className="mt-8 rounded-2xl border border-white/15 bg-white/[.07] p-4 text-xs leading-6 text-blue-100/85">
                        <p className="font-bold text-white">Before you continue</p>
                        <p className="mt-1">The invitation expires after 24 hours and may be used once. If this email already belongs to another account, ask the platform administrator to use a separate official email address for the College Admin account.</p>
                    </div>
                </aside>

                <section className="p-6 sm:p-10 lg:p-11">
                    <div className="mb-8">
                        <p className="text-xs font-extrabold uppercase tracking-[.18em] text-blue-700">Complete registration</p>
                        <h2 className="mt-2 text-3xl font-extrabold tracking-[-.045em] text-slate-900">Set up your account</h2>
                        <p className="mt-3 text-sm leading-6 text-slate-500">Enter your name and create a strong password to activate your College Admin account.</p>
                    </div>

                    {!token ? <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                        This invitation link is incomplete because its security token is missing. Open the complete link from the invitation email or ask the Super Admin to send a new invitation.
                    </div> : <form onSubmit={submit} className="space-y-5">
                        <Input label="Full name" name="name" autoComplete="name" value={name} onChange={event => setName(event.target.value)} required minLength={2} maxLength={160} placeholder="Enter your full name" />
                        <Input label="Create password" name="password" type="password" autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} required minLength={8} maxLength={128} placeholder="Create a strong password" />
                        <Input label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} required minLength={8} maxLength={128} placeholder="Enter your password again" />
                        <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                            <p className="text-xs font-bold text-blue-950">Password requirements</p>
                            <p className="mt-1 text-xs leading-5 text-blue-900/80">At least 8 characters, including uppercase and lowercase letters, a number, and a special character.</p>
                        </div>
                        {errorMessage && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{errorMessage}</div>}
                        <Button type="submit" className="!flex min-h-12 w-full items-center justify-center !rounded-xl" disabled={loading}>
                            {loading ? "Creating account…" : "Complete account setup"}
                        </Button>
                        <p className="text-center text-xs leading-5 text-slate-400">Your account is not created unless setup completes successfully.</p>
                    </form>}
                    <div className="mt-8 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">Already have an account? <Link to="/login" className="font-bold text-blue-700 transition hover:text-blue-900">Sign in</Link></div>
                </section>
            </div>
        </div>
    </PageContainer>;
}
