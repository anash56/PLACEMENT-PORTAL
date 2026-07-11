import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminRoute({ children }) {

    const { isAuthenticated, isAdmin } = useAuth();

    if (!isAuthenticated) {

        return <Navigate to="/login" />;

    }

    if (!isAdmin) {

        return <Navigate to="/" />;

    }

    return children;

}

export default AdminRoute;