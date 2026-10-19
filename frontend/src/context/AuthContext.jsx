import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api, { setCsrfToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const response = await api.get("/auth/me");
            const { csrfToken, ...safeUser } = response.data;
            setCsrfToken(csrfToken);
            setUser(safeUser);
            return safeUser;
        } catch {
            setUser(null);
            return null;
        } finally {
            setAuthLoading(false);
        }
    }, []);

    useEffect(() => { refreshUser(); }, [refreshUser]);

    const login = useCallback(async () => {
        // The login API sets the HTTP-only JWT cookie; always hydrate identity from /me.
        return refreshUser();
    }, [refreshUser]);

    const logout = useCallback(async () => {
        try { await api.post("/auth/logout"); } finally { setCsrfToken(null); setUser(null); }
    }, []);

    const value = useMemo(() => ({
        user, authLoading, login, logout, refreshUser,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === "college_admin" || user?.role === "super_admin",
        isCollegeAdmin: user?.role === "college_admin",
        isSuperAdmin: user?.role === "super_admin",
        isStudent: user?.role === "student"
    }), [user, authLoading, login, logout, refreshUser]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
}
