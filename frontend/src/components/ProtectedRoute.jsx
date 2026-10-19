import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function ProtectedRoute({ children }) {
    const { isAuthenticated, authLoading } = useAuth();
    if (authLoading) return <div className="p-10 text-center text-gray-500">Checking session…</div>;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
}
