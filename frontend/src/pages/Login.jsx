import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../services/api";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import PageContainer from "../components/ui/PageContainer";

import { useAuth } from "../context/AuthContext";


function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isForgotView, setIsForgotView] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            if (isForgotView) {
                const res = await api.post("/auth/forgot-password", { email });
                toast.success(res.data.message || "Reset link sent!");
                setIsForgotView(false);
            } else {
                const res = await api.post("/auth/login", { email, password });
                const loggedInUser = {
                    name: res.data.name,
                    email: res.data.email,
                    role: res.data.role,
                    token: res.data.token
                };
                login(loggedInUser);
                toast.success("Login Successful");

                if (res.data.role === "admin") {
                    navigate("/admin");
                } else {
                    navigate("/");
                }
            }
        } catch (error) {
            console.log(error.response?.data);
            toast.error(
                error.response?.data?.message || (isForgotView ? "Failed to send reset link" : "Login Failed")
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer className="flex items-center justify-center">
            <Card className="w-full max-w-md">
                <div className="mb-6 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isForgotView ? "Reset Password" : "Welcome Back"}
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        {isForgotView
                            ? "Enter your registered email address to receive a password reset link."
                            : "Login to continue to Placement Portal"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    {!isForgotView && (
                        <div>
                            <Input
                                label="Password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <div className="mt-1.5 text-right">
                                <button
                                    type="button"
                                    onClick={() => setIsForgotView(true)}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full"
                    >
                        {loading
                            ? isForgotView
                                ? "Sending Link..."
                                : "Logging in..."
                            : isForgotView
                            ? "Send Reset Link"
                            : "Login"}
                    </Button>

                    {isForgotView && (
                        <div className="mt-3 text-center">
                            <button
                                type="button"
                                onClick={() => setIsForgotView(false)}
                                className="text-xs font-medium text-gray-500 hover:text-gray-700"
                            >
                                ← Back to Login
                            </button>
                        </div>
                    )}
                </form>
            </Card>
        </PageContainer>
    );
}

export default Login;