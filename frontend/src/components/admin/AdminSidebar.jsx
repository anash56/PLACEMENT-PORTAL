import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ConfirmationModal from "../ui/ConfirmationModal";

export default function AdminSidebar({ sidebarOpen, closeSidebar }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [logoutOpen, setLogoutOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const classes = ({ isActive }) => `block rounded-xl px-4 py-3 text-sm font-semibold transition ${isActive ? "bg-blue-50 text-[#174f97] ring-1 ring-blue-100" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`;

    const doLogout = async () => {
        if (loggingOut) return;
        setLoggingOut(true);
        try {
            await logout();
            setLogoutOpen(false);
            closeSidebar();
            navigate("/login");
        } finally {
            setLoggingOut(false);
        }
    };

    return <>
        {sidebarOpen && <div onClick={closeSidebar} className="fixed inset-0 z-40 bg-slate-950/40 md:hidden" />}
        <aside className={`portal-admin-sidebar fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-slate-200 bg-white p-4 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:static md:z-auto md:translate-x-0 md:shrink-0`}>
            <div className="mb-8 px-2">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Placement Portal</h1>
                        <p className="mt-1 break-words text-sm text-slate-600">{user?.collegeName || "College Admin"}</p>
                    </div>
                    <button type="button" onClick={closeSidebar} className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 md:hidden" aria-label="Close sidebar">×</button>
                </div>
            </div>
            <nav className="space-y-2">
                <NavLink to="/admin" end className={classes} onClick={closeSidebar}>Dashboard</NavLink>
                <NavLink to="/admin/jobs" end className={classes} onClick={closeSidebar}>Manage Jobs</NavLink>
                <NavLink to="/admin/jobs/create" className={classes} onClick={closeSidebar}>Create Job</NavLink>
                <NavLink to="/admin/students/verification" className={classes} onClick={closeSidebar}>Verify Students</NavLink>
            </nav>
            <div className="mt-auto border-t border-slate-200 pt-4">
                <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-3">
                    <p className="break-words text-sm font-bold text-slate-900">{user?.name || "Admin"}</p>
                    <p className="mt-1 break-all text-xs text-slate-600">{user?.email}</p>
                </div>
                <button
                    type="button"
                    onClick={() => setLogoutOpen(true)}
                    className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#174f97] bg-[#174f97] px-4 py-3 text-left text-sm font-bold text-white shadow-sm transition hover:bg-[#123f78] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                >
                    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></svg>
                    Sign out
                </button>
            </div>
        </aside>
        <ConfirmationModal
            open={logoutOpen}
            title="Sign out?"
            message="Are you sure you want to sign out of your College Admin workspace?"
            onCancel={() => { if (!loggingOut) setLogoutOpen(false); }}
            onConfirm={doLogout}
            loading={loggingOut}
            confirmText="Sign out"
            confirmVariant="primary"
        />
    </>;
}
