import {
    lazy,
    Suspense
} from "react";

import {
    BrowserRouter,
    Routes,
    Route,
    Outlet
} from "react-router-dom";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Jobs = lazy(() => import("./pages/Jobs"));
const MyApplications = lazy(() => import("./pages/MyApplications"));
const Profile = lazy(() => import("./pages/Profile"));

const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const CreateJob = lazy(() => import("./pages/CreateJob"));
const Applicants = lazy(() => import("./pages/Applicants"));
const ManageJobs = lazy(() => import("./pages/ManageJobs"));
const EditJob = lazy(() => import("./pages/EditJob"));

import Navbar from "./components/Navbar";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import AdminLayout from "./layouts/AdminLayout";


function NormalLayout() {

    return (

        <>

            <Navbar />

            <Outlet />

        </>

    );

}

function LoadingFallback() {
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                <p className="text-sm font-medium text-gray-500 animate-pulse">Loading page...</p>
            </div>
        </div>
    );
}


function App() {

    return (

        <BrowserRouter>

            <Suspense fallback={<LoadingFallback />}>

                <Routes>

                    {/* GUEST + STUDENT ROUTES */}

                    <Route element={<NormalLayout />}>

                        <Route
                            path="/"
                            element={<Jobs />}
                        />

                        <Route
                            path="/login"
                            element={<Login />}
                        />

                        <Route
                            path="/register"
                            element={<Register />}
                        />

                        <Route
                            path="/reset-password/:token"
                            element={<ResetPassword />}
                        />

                        <Route

                            path="/my-applications"

                            element={

                                <ProtectedRoute>

                                    <MyApplications />

                                </ProtectedRoute>

                            }

                        />

                        <Route

                            path="/profile"

                            element={

                                <ProtectedRoute>

                                    <Profile />

                                </ProtectedRoute>

                            }

                        />

                    </Route>


                    {/* ADMIN ROUTES */}

                    <Route

                        path="/admin"

                        element={

                            <AdminRoute>

                                <AdminLayout />

                            </AdminRoute>

                        }

                    >

                        <Route
                            index
                            element={<AdminDashboard />}
                        />

                        <Route
                            path="jobs"
                            element={<ManageJobs />}
                        />

                        <Route
                            path="jobs/create"
                            element={<CreateJob />}
                        />

                        <Route
                            path="jobs/:id/edit"
                            element={<EditJob />}
                        />

                        <Route
                            path="jobs/:jobId/applicants"
                            element={<Applicants />}
                        />

                    </Route>

                </Routes>

            </Suspense>

        </BrowserRouter>

    );

}


export default App;