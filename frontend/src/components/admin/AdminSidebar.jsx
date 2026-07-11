import { useState } from "react";
import {
    NavLink,
    useNavigate
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import ConfirmationModal from "../ui/ConfirmationModal";


function AdminSidebar({
    sidebarOpen,
    closeSidebar
}) {

    const navigate = useNavigate();

    const {
        user,
        logout
    } = useAuth();


    const [logoutOpen, setLogoutOpen] = useState(false);

    const handleLogout = () => {

        setLogoutOpen(true);

    };

    const confirmLogout = () => {

        logout();

        closeSidebar();

        setLogoutOpen(false);

        navigate("/login");

    };


    const getNavLinkClasses = ({ isActive }) => {

        const baseClasses =
            "block rounded-lg px-4 py-3 text-sm font-medium transition";

        const activeClasses =
            "bg-blue-600 text-white";

        const inactiveClasses =
            "text-gray-600 hover:bg-gray-100 hover:text-gray-900";


        return `${baseClasses} ${
            isActive
                ? activeClasses
                : inactiveClasses
        }`;

    };


    return (

        <>

            {/* Mobile Overlay */}

            {
                sidebarOpen && (

                    <div
                        onClick={closeSidebar}
                        className="
                            fixed
                            inset-0
                            z-40
                            bg-black/40
                            md:hidden
                        "
                    />

                )
            }


            {/* Sidebar */}

            <aside
                className={`
                    fixed
                    inset-y-0
                    left-0
                    z-50
                    flex
                    h-screen
                    w-64
                    flex-col
                    border-r
                    border-gray-200
                    bg-white
                    p-4
                    transition-transform
                    duration-300

                    ${
                        sidebarOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                    }

                    md:static
                    md:z-auto
                    md:translate-x-0
                    md:shrink-0
                `}
            >

                <div className="mb-8 px-2">

                    <div className="flex items-start justify-between">

                        <div>

                            <h1 className="text-xl font-bold text-gray-900">

                                Placement Portal

                            </h1>


                            <p className="mt-1 text-sm text-gray-500">

                                Admin Panel

                            </p>

                        </div>


                        <button
                            type="button"
                            onClick={closeSidebar}
                            className="
                                rounded-lg
                                px-2
                                py-1
                                text-gray-500
                                hover:bg-gray-100
                                md:hidden
                            "
                        >

                            X

                        </button>

                    </div>

                </div>


                <nav className="space-y-2">

                    <NavLink
                        to="/admin"
                        end
                        onClick={closeSidebar}
                        className={getNavLinkClasses}
                    >

                        Dashboard

                    </NavLink>


                    <NavLink
                        to="/admin/jobs"
                        end
                        onClick={closeSidebar}
                        className={getNavLinkClasses}
                    >

                        Manage Jobs

                    </NavLink>


                    <NavLink
                        to="/admin/jobs/create"
                        onClick={closeSidebar}
                        className={getNavLinkClasses}
                    >

                        Create Job

                    </NavLink>

                </nav>


                <div className="mt-auto border-t border-gray-200 pt-4">

                    <div className="mb-4 px-2">

                        <p className="text-sm font-medium text-gray-900">

                            {user?.name || "Admin"}

                        </p>


                        <p className="truncate text-xs text-gray-500">

                            {user?.email}

                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={handleLogout}
                        className="
                            w-full
                            rounded-lg
                            px-4
                            py-3
                            text-left
                            text-sm
                            font-medium
                            text-red-600
                            transition
                            hover:bg-red-50
                        "
                    >

                        Logout

                    </button>

                </div>

            </aside>

            <ConfirmationModal
                open={logoutOpen}
                title="Logout"
                message="Are you sure you want to logout?"
                onCancel={() => setLogoutOpen(false)}
                onConfirm={confirmLogout}
                confirmText="Logout"
                confirmVariant="danger"
            />

        </>

    );

}


export default AdminSidebar;