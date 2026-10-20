import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ConfirmationModal from "../ui/ConfirmationModal";
export default function AdminSidebar({ sidebarOpen, closeSidebar }) {
    const { user, logout } = useAuth(); const navigate = useNavigate(); const [logoutOpen, setLogoutOpen] = useState(false);
    const classes = ({ isActive }) => `block rounded-lg px-4 py-3 text-sm font-medium transition ${isActive ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`;
    const doLogout = async () => { await logout(); setLogoutOpen(false); closeSidebar(); navigate("/login"); };
    return <><>{sidebarOpen && <div onClick={closeSidebar} className="fixed inset-0 z-40 bg-black/40 md:hidden" />}</><aside className={`portal-admin-sidebar fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-gray-200 bg-white p-4 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:static md:z-auto md:translate-x-0 md:shrink-0`}>
        <div className="mb-8 px-2"><div className="flex items-start justify-between"><div><h1 className="text-xl font-bold text-gray-900">Placement Portal</h1><p className="mt-1 text-sm text-gray-500">{user?.collegeName || "College Admin"}</p></div><button type="button" onClick={closeSidebar} className="rounded-lg px-2 py-1 text-gray-500 hover:bg-gray-100 md:hidden">X</button></div></div>
        <nav className="space-y-2"><NavLink to="/admin" end className={classes} onClick={closeSidebar}>Dashboard</NavLink><NavLink to="/admin/jobs" end className={classes} onClick={closeSidebar}>Manage Jobs</NavLink><NavLink to="/admin/jobs/create" className={classes} onClick={closeSidebar}>Create Job</NavLink><NavLink to="/admin/students/verification" className={classes} onClick={closeSidebar}>Verify Students</NavLink></nav>
        <div className="mt-auto border-t border-gray-200 pt-4"><div className="mb-4 px-2"><p className="text-sm font-medium text-gray-900">{user?.name || "Admin"}</p><p className="truncate text-xs text-gray-500">{user?.email}</p></div><button type="button" onClick={() => setLogoutOpen(true)} className="w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50">Logout</button></div>
    </aside><ConfirmationModal open={logoutOpen} title="Logout" message="Are you sure you want to logout?" onCancel={() => setLogoutOpen(false)} onConfirm={doLogout} confirmText="Logout" confirmVariant="danger" /></>;
}

