import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";

import RoleRoute from "./components/RoleRoute";
import AdminLayout from "./layouts/AdminLayout";
import { useAuth } from "./context/AuthContext";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Jobs = lazy(() => import("./pages/Jobs"));
const JobDetails = lazy(() => import("./pages/JobDetails"));
const MyApplications = lazy(() => import("./pages/MyApplications"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const CreateJob = lazy(() => import("./pages/CreateJob"));
const Applicants = lazy(() => import("./pages/Applicants"));
const ManageJobs = lazy(() => import("./pages/ManageJobs"));
const EditJob = lazy(() => import("./pages/EditJob"));
const CollegeOnboarding = lazy(() => import("./pages/CollegeOnboarding"));
const SuperAdminDashboard = lazy(() => import("./pages/SuperAdminDashboard"));
const AcceptInvitation = lazy(() => import("./pages/AcceptInvitation"));
const VerificationQueue = lazy(() => import("./pages/VerificationQueue"));

function NormalLayout() {
    const location = useLocation();
    const isFullScreenAuth = ["/login", "/register"].includes(location.pathname);
    return <>{!isFullScreenAuth && <Navbar />}<Outlet /></>;
}

function LandingRoute() {
    const { isAuthenticated, isStudent, isCollegeAdmin, isSuperAdmin } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (isAuthenticated) {
            navigate(isSuperAdmin ? "/super-admin" : isCollegeAdmin ? "/admin" : isStudent ? "/jobs" : "/jobs", { replace: true });
        }
    }, [isAuthenticated, isStudent, isCollegeAdmin, isSuperAdmin, navigate]);
    return isAuthenticated
        ? <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-600">Opening your workspace…</div>
        : <LandingPage />;
}

function LoadingFallback() {
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                <p className="text-sm font-medium text-slate-600">Preparing your experience…</p>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
                <Routes>
                    <Route element={<NormalLayout />}>
                        <Route path="/" element={<LandingRoute />} />
                        <Route path="/jobs" element={<Jobs />} />
                        <Route path="/jobs/:jobId" element={<JobDetails />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/college-onboarding" element={<CollegeOnboarding />} />
                        <Route path="/accept-invitation" element={<AcceptInvitation />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />
                        <Route path="/my-applications" element={<RoleRoute roles={["student"]}><MyApplications /></RoleRoute>} />
                        <Route path="/profile" element={<RoleRoute roles={["student"]}><Profile /></RoleRoute>} />
                        <Route path="/super-admin" element={<RoleRoute roles={["super_admin"]}><SuperAdminDashboard /></RoleRoute>} />
                    </Route>
                    <Route path="/admin" element={<RoleRoute roles={["college_admin"]}><AdminLayout /></RoleRoute>}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="jobs" element={<ManageJobs />} />
                        <Route path="jobs/create" element={<CreateJob />} />
                        <Route path="jobs/:id/edit" element={<EditJob />} />
                        <Route path="jobs/:jobId/applicants" element={<Applicants />} />
                        <Route path="students/verification" element={<VerificationQueue />} />
                    </Route>
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
