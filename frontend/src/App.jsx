import {
    BrowserRouter,
    Routes,
    Route,
    Outlet
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Jobs from "./pages/Jobs";
import MyApplications from "./pages/MyApplications";
import Profile from "./pages/Profile";

import AdminDashboard from "./pages/AdminDashboard";
import CreateJob from "./pages/CreateJob";
import Applicants from "./pages/Applicants";
import ManageJobs from "./pages/ManageJobs";
import EditJob from "./pages/EditJob";

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


function App() {

    return (

        <BrowserRouter>

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

        </BrowserRouter>

    );

}


export default App;