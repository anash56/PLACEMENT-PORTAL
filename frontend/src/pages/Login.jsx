import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import PageContainer from "../components/ui/PageContainer";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [loading, setLoading] = useState(false); const [isForgotView, setIsForgotView] = useState(false);
    const navigate = useNavigate(); const { login } = useAuth();
    const handleSubmit = async event => {
        event.preventDefault();
        try {
            setLoading(true);
            if (isForgotView) {
                const result = await api.post("/auth/forgot-password", { email }); toast.success(result.data.message || "If the account exists, a reset link will be sent."); setIsForgotView(false); return;
            }
            await api.post("/auth/login", { email, password });
            const user = await login();
            if (!user) throw new Error("The server created a session but the current user could not be loaded.");
            toast.success("Login successful.");
            navigate(user.role === "super_admin" ? "/super-admin" : user.role === "college_admin" ? "/admin" : "/");
        } catch (error) { toast.error(error.response?.data?.message || error.message || "Login failed."); }
        finally { setLoading(false); }
    };
    return <PageContainer className="flex items-center justify-center"><Card className="w-full max-w-md">
        <div className="mb-6 text-center"><h1 className="text-3xl font-bold text-gray-900">{isForgotView ? "Reset Password" : "Welcome Back"}</h1><p className="mt-2 text-sm text-gray-500">{isForgotView ? "Enter your email to request a password reset." : "Login to your Placement Portal account."}</p></div>
        <form onSubmit={handleSubmit} className="space-y-4"><Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            {!isForgotView && <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />}
            {!isForgotView && <div className="text-right"><button type="button" onClick={() => setIsForgotView(true)} className="text-xs font-semibold text-blue-600">Forgot Password?</button></div>}
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Please wait…" : isForgotView ? "Send Reset Link" : "Login"}</Button>
            {isForgotView && <button type="button" className="w-full text-sm text-gray-600" onClick={() => setIsForgotView(false)}>Back to login</button>}
        </form>
    </Card></PageContainer>;
}
