import { useState } from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "../components/admin/AdminSidebar";
import "./admin-workspace.css";

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="portal-admin-shell flex h-screen overflow-hidden bg-gray-50">
            <AdminSidebar
                sidebarOpen={sidebarOpen}
                closeSidebar={() => setSidebarOpen(false)}
            />

            <div className="portal-admin-main flex min-w-0 flex-1 flex-col">
                <header className="portal-admin-mobile-header flex h-16 shrink-0 items-center border-b border-gray-200 bg-white px-4 md:hidden">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(true)}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        aria-label="Open admin navigation"
                        aria-expanded={sidebarOpen}
                    >
                        Menu
                    </button>
                    <p className="ml-4 font-semibold text-gray-900">Placement Portal</p>
                </header>

                <main className="portal-admin-scroll min-w-0 flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
