import {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import api from "../services/api";

import { useAuth } from "../context/AuthContext";

import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import PageContainer from "../components/ui/PageContainer";


function AdminDashboard() {

    const navigate = useNavigate();

    const { user } = useAuth();


    const [stats, setStats] = useState({

        totalStudents: 0,

        totalJobs: 0,

        totalApplications: 0,

        statusBreakdown: {
            Pending: 0,
            "Test Scheduled": 0,
            "Interview Scheduled": 0,
            Shortlisted: 0,
            Offered: 0,
            Rejected: 0
        },

        branchBreakdown: [],

        salaryStats: {
            averageSalary: 0,
            maxSalary: 0,
            minSalary: 0
        }

    });


    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() => {

        fetchDashboardStats();

    }, []);


    const fetchDashboardStats = async () => {

        try {

            setLoading(true);

            setError("");


            const res = await api.get(

                "/dashboard/stats"

            );


            setStats(res.data);

        }

        catch (error) {

            console.log(
                error.response?.data
            );


            setError(

                error.response?.data?.message

                ||

                "Failed to load dashboard statistics."

            );

        }

        finally {

            setLoading(false);

        }

    };


    const statCards = [

        {
            label: "Total Students",
            value: stats.totalStudents,
            description: "Registered student accounts"
        },

        {
            label: "Average CTC",
            value: `₹${(stats.salaryStats?.averageSalary || 0).toLocaleString("en-IN")}`,
            description: "Average annual package"
        },

        {
            label: "Total Jobs",
            value: stats.totalJobs,
            description: "Published job opportunities"
        },

        {
            label: "Total Applications",
            value: stats.totalApplications,
            description: "Applications submitted by students"
        }

    ];


    return (

        <PageContainer>

            <div className="mb-8">

                <h1 className="text-3xl font-bold text-gray-900">

                    Admin Dashboard

                </h1>


                <p className="mt-2 text-sm text-gray-500">

                    Welcome back, {user?.name || "Admin"}.
                    Here is an overview of your placement portal.

                </p>

            </div>


            {
                loading

                    ?

                    <Card>

                        <p className="text-center text-gray-500">

                            Loading dashboard...

                        </p>

                    </Card>


                    :

                    error

                        ?

                        <Card>

                            <div className="py-6 text-center">

                                <h2 className="text-lg font-semibold text-gray-900">

                                    Unable to Load Dashboard

                                </h2>


                                <p className="mt-2 text-sm text-gray-500">

                                    {error}

                                </p>


                                <div className="mt-4">

                                    <Button
                                        onClick={fetchDashboardStats}
                                    >

                                        Try Again

                                    </Button>

                                </div>

                            </div>

                        </Card>


                        :

                        <>

                            <div
                                className="
                                    grid
                                    gap-4
                                    sm:grid-cols-2
                                    xl:grid-cols-4
                                "
                            >

                                {

                                    statCards.map((stat) => (

                                        <Card
                                            key={stat.label}
                                            className="h-full"
                                        >

                                            <p className="text-sm font-medium text-gray-500">

                                                {stat.label}

                                            </p>


                                            <p className="mt-3 text-3xl font-bold text-gray-900">

                                                {stat.value}

                                            </p>


                                            <p className="mt-2 text-sm text-gray-500">

                                                {stat.description}

                                            </p>

                                        </Card>

                                    ))

                                }

                            </div>

                            {/* Rich Analytics Widgets */}
                            <div className="mt-8 grid gap-6 lg:grid-cols-2">
                                {/* Application pipeline metrics */}
                                <Card>
                                    <h2 className="text-lg font-bold text-gray-900 mb-5 border-b border-gray-100 pb-3">Recruitment Pipeline</h2>
                                    <div className="space-y-4">
                                        {Object.entries(stats.statusBreakdown || {}).map(([status, count]) => {
                                            const percentage = stats.totalApplications > 0 ? (count / stats.totalApplications) * 100 : 0;
                                            return (
                                                <div key={status}>
                                                    <div className="flex justify-between text-sm mb-1.5">
                                                        <span className="font-semibold text-gray-600">{status}</span>
                                                        <span className="font-bold text-gray-900">{count} ({Math.round(percentage)}%)</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                                        <div 
                                                            className={`h-2 rounded-full transition-all duration-500 ${
                                                                status === "Offered" || status === "Shortlisted" 
                                                                    ? "bg-green-500" 
                                                                    : status === "Rejected" 
                                                                        ? "bg-red-500" 
                                                                        : "bg-blue-500"
                                                            }`} 
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Card>

                                {/* Student Branch & Salary Stats */}
                                <div className="space-y-6">
                                    <Card>
                                        <h2 className="text-lg font-bold text-gray-900 mb-5 border-b border-gray-100 pb-3">Branch Distribution</h2>
                                        {stats.branchBreakdown && stats.branchBreakdown.length > 0 ? (
                                            <div className="max-h-48 overflow-y-auto space-y-3">
                                                {stats.branchBreakdown.map((branch, idx) => (
                                                    <div key={idx} className="flex justify-between items-center text-sm">
                                                        <span className="font-medium text-gray-600">{branch.name}</span>
                                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                                                            {branch.value} student{branch.value > 1 ? "s" : ""}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500 text-center py-4">No student branch data available.</p>
                                        )}
                                    </Card>

                                    <Card>
                                        <h2 className="text-lg font-bold text-gray-900 mb-5 border-b border-gray-100 pb-3">Salary Statistics</h2>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="rounded-lg bg-gray-50 p-4 text-center">
                                                <p className="text-xs font-medium text-gray-500">MAXIMUM CTC</p>
                                                <p className="mt-1 text-lg font-bold text-blue-600">₹{(stats.salaryStats?.maxSalary || 0).toLocaleString("en-IN")}</p>
                                            </div>
                                            <div className="rounded-lg bg-gray-50 p-4 text-center">
                                                <p className="text-xs font-medium text-gray-500">MINIMUM CTC</p>
                                                <p className="mt-1 text-lg font-bold text-blue-600">₹{(stats.salaryStats?.minSalary || 0).toLocaleString("en-IN")}</p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </div>


                            <div className="mt-8">

                                <h2 className="text-xl font-semibold text-gray-900">

                                    Quick Actions

                                </h2>


                                <p className="mt-1 text-sm text-gray-500">

                                    Access common administrative tasks.

                                </p>


                                <div
                                    className="
                                        mt-4
                                        grid
                                        gap-4
                                        md:grid-cols-2
                                    "
                                >

                                    <Card>

                                        <h3 className="text-lg font-semibold text-gray-900">

                                            Manage Jobs

                                        </h3>


                                        <p className="mt-2 text-sm leading-6 text-gray-500">

                                            Review existing jobs, search listings,
                                            view applicants, edit job information,
                                            or remove opportunities.

                                        </p>


                                        <div className="mt-5">

                                            <Button
                                                onClick={() =>
                                                    navigate("/admin/jobs")
                                                }
                                            >

                                                Manage Jobs

                                            </Button>

                                        </div>

                                    </Card>


                                    <Card>

                                        <h3 className="text-lg font-semibold text-gray-900">

                                            Create Job

                                        </h3>


                                        <p className="mt-2 text-sm leading-6 text-gray-500">

                                            Publish a new job opportunity for
                                            students using the placement portal.

                                        </p>


                                        <div className="mt-5">

                                            <Button
                                                onClick={() =>
                                                    navigate("/admin/jobs/create")
                                                }
                                            >

                                                Create Job

                                            </Button>

                                        </div>

                                    </Card>

                                </div>

                            </div>

                        </>

            }

        </PageContainer>

    );

}


export default AdminDashboard;