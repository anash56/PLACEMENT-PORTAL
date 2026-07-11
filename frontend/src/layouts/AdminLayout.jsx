import { useState } from "react";
import { Outlet } from "react-router-dom";

import AdminSidebar from "../components/admin/AdminSidebar";


function AdminLayout() {

    const [sidebarOpen, setSidebarOpen] =
        useState(false);


    const openSidebar = () => {

        setSidebarOpen(true);

    };


    const closeSidebar = () => {

        setSidebarOpen(false);

    };


    return (

        <div className="flex h-screen overflow-hidden bg-gray-50">

            <AdminSidebar
                sidebarOpen={sidebarOpen}
                closeSidebar={closeSidebar}
            />


            <div className="flex min-w-0 flex-1 flex-col">

                <header
                    className="
                        flex
                        h-16
                        shrink-0
                        items-center
                        border-b
                        border-gray-200
                        bg-white
                        px-4
                        md:hidden
                    "
                >

                    <button
                        type="button"
                        onClick={openSidebar}
                        className="
                            rounded-lg
                            border
                            border-gray-300
                            px-3
                            py-2
                            text-sm
                            font-medium
                            text-gray-700
                            hover:bg-gray-50
                        "
                    >

                        Menu

                    </button>


                    <p className="ml-4 font-semibold text-gray-900">

                        Placement Portal

                    </p>

                </header>


                <main className="min-w-0 flex-1 overflow-y-auto">

                    <Outlet />

                </main>

            </div>

        </div>

    );

}


export default AdminLayout;