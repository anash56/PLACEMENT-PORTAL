import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../services/api";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import PageContainer from "../components/ui/PageContainer";

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return toast.error("Passwords do not match.");
        }

        if (password.length < 8) {
            return toast.error("Password must be at least 8 characters long.");
        }

        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);

        if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
            return toast.error(
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
            );
        }

        try {
            setLoading(true);
            const res = await api.post(`/auth/reset-password/${token}`, { password });
            toast.success(res.data.message || "Password reset successfully!");
            navigate("/login");
        } catch (error) {
            console.error(error.response?.data);
            toast.error(error.response?.data?.message || "Failed to reset password. Link may be expired.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer className="flex items-center justify-center">
            <Card className="w-full max-w-md">
                <div className="mb-6 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Set New Password</h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Please enter and confirm your new password below.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="New Password"
                        type="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <Input
                        label="Confirm New Password"
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Resetting Password..." : "Update Password"}
                    </Button>
                </form>
            </Card>
        </PageContainer>
    );
}

export default ResetPassword;
