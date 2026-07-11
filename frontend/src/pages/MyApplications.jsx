import {
    useEffect,
    useState
} from "react";

import api from "../services/api";

import PageContainer from "../components/ui/PageContainer";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

function MyApplications() {

    const [applications, setApplications] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {

        fetchApplications();

    }, [page]);

    const fetchApplications = async () => {

        try {

            setLoading(true);

            setError("");

            const res = await api.get(

                `/applications/my?page=${page}&limit=5`

            );

            const activeApplications = (res.data.applications || []).filter(
                (app) => app.job !== null && app.job !== undefined
            );

            setApplications(

                activeApplications

            );

            setTotalPages(res.data.totalPages || 1);

        }

        catch (error) {

            console.log(error);

            setError(

                error.response?.data?.message ||

                "Failed to load your applications."

            );

        }

        finally {

            setLoading(false);

        }

    };

    const getStatusBadge = (status) => {

        switch (status) {

            case "Pending":

                return (
                    <span
                        className="
                            inline-flex
                            rounded-full
                            bg-yellow-100
                            px-3
                            py-1
                            text-sm
                            font-semibold
                            text-yellow-700
                        "
                    >
                        Pending
                    </span>
                );

            case "Test Scheduled":

                return (
                    <span
                        className="
                            inline-flex
                            rounded-full
                            bg-blue-100
                            px-3
                            py-1
                            text-sm
                            font-semibold
                            text-blue-700
                        "
                    >
                        Test Scheduled
                    </span>
                );

            case "Interview Scheduled":

                return (
                    <span
                        className="
                            inline-flex
                            rounded-full
                            bg-purple-100
                            px-3
                            py-1
                            text-sm
                            font-semibold
                            text-purple-700
                        "
                    >
                        Interview Scheduled
                    </span>
                );

            case "Shortlisted":

                return (
                    <span
                        className="
                            inline-flex
                            rounded-full
                            bg-green-100
                            px-3
                            py-1
                            text-sm
                            font-semibold
                            text-green-700
                        "
                    >
                        Shortlisted
                    </span>
                );

            case "Offered":

                return (
                    <span
                        className="
                            inline-flex
                            rounded-full
                            bg-emerald-100
                            px-3
                            py-1
                            text-sm
                            font-semibold
                            text-emerald-700
                        "
                    >
                        Offered
                    </span>
                );

            case "Rejected":

                return (
                    <span
                        className="
                            inline-flex
                            rounded-full
                            bg-red-100
                            px-3
                            py-1
                            text-sm
                            font-semibold
                            text-red-700
                        "
                    >
                        Rejected
                    </span>
                );

            default:

                return (
                    <span
                        className="
                            inline-flex
                            rounded-full
                            bg-gray-100
                            px-3
                            py-1
                            text-sm
                            font-semibold
                            text-gray-700
                        "
                    >
                        {status}
                    </span>
                );

        }

    };

    const renderTimeline = (status) => {
        const steps = [
            { label: "Applied", key: "Pending" },
            { label: "Online Test", key: "Test Scheduled" },
            { label: "Interview", key: "Interview Scheduled" },
            { label: "Selected", key: "Shortlisted" } // includes Offered
        ];

        const statusOrder = ["Pending", "Test Scheduled", "Interview Scheduled", "Shortlisted", "Offered"];
        const currentOrderIndex = status === "Rejected" ? -1 : statusOrder.indexOf(status);

        // Map status to step index
        let activeStepIndex = 0;
        if (status === "Test Scheduled") activeStepIndex = 1;
        else if (status === "Interview Scheduled") activeStepIndex = 2;
        else if (status === "Shortlisted" || status === "Offered") activeStepIndex = 3;

        return (
            <div className="mt-8 border-t border-gray-100 pt-6">
                <p className="text-sm font-semibold text-gray-700 mb-6">Application Progress</p>
                
                {status === "Rejected" ? (
                    <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50/50 p-4 text-sm text-red-800">
                        <svg className="h-5 w-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <span className="font-semibold">Application Rejected:</span> Unfortunately, you were not selected for this position.
                        </div>
                    </div>
                ) : (
                    <div className="relative flex items-center justify-between px-2">
                        {/* Connecting Line background */}
                        <div className="absolute left-6 right-6 top-4 h-0.5 bg-gray-200"></div>
                        
                        {/* Connecting Line active progress */}
                        <div 
                            className="absolute left-6 top-4 h-0.5 bg-blue-600 transition-all duration-500"
                            style={{ 
                                width: `calc(${(activeStepIndex / (steps.length - 1)) * 100}% - ${activeStepIndex === 3 ? '1.5rem' : '0rem'})` 
                            }}
                        ></div>

                        {steps.map((step, index) => {
                            const isCompleted = index < activeStepIndex;
                            const isActive = index === activeStepIndex;
                            
                            return (
                                <div key={index} className="relative z-10 flex flex-col items-center">
                                    <div 
                                        className={`flex h-8.5 w-8.5 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 ${
                                            isCompleted 
                                                ? "bg-blue-600 border-blue-600 text-white" 
                                                : isActive 
                                                    ? "bg-white border-blue-600 text-blue-600 shadow-md scale-110" 
                                                    : "bg-white border-gray-300 text-gray-400"
                                        }`}
                                    >
                                        {isCompleted ? (
                                            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            index + 1
                                        )}
                                    </div>
                                    <span 
                                        className={`mt-2 text-[11px] font-semibold tracking-wide uppercase ${
                                            isActive 
                                                ? "text-blue-600 font-bold" 
                                                : isCompleted 
                                                    ? "text-gray-950" 
                                                    : "text-gray-400"
                                        }`}
                                    >
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {

        return (

            <PageContainer>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mt-2 animate-pulse"></div>
                </div>

                <div className="space-y-5">
                    {[1, 2].map((n) => (
                        <Card key={n} className="animate-pulse">
                            <div className="flex flex-col gap-5 md:flex-row md:justify-between md:items-start">
                                <div className="flex-1 space-y-4">
                                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                                    <div className="h-4 bg-blue-200 rounded w-1/4"></div>
                                    <div className="grid gap-3 sm:grid-cols-2 mt-4">
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                    <div className="h-16 bg-gray-200 rounded w-full mt-5"></div>
                                </div>
                                <div className="h-14 bg-gray-200 rounded w-24"></div>
                            </div>
                        </Card>
                    ))}
                </div>

            </PageContainer>

        );

    }

    return (

        <PageContainer>

            <div className="mb-8">

                <h1 className="text-3xl font-bold text-gray-900">

                    My Applications

                </h1>

                <p className="mt-2 text-sm text-gray-500">

                    Track every job you have applied for.

                </p>

            </div>

            {

                error

                ?

                (

                    <Card>

                        <div className="py-10 text-center">

                            <h2 className="text-xl font-semibold">

                                Unable To Load Applications

                            </h2>

                            <p className="mt-2 text-gray-500">

                                {error}

                            </p>

                            <div className="mt-5">

                                <Button

                                    onClick={fetchApplications}

                                >

                                    Try Again

                                </Button>

                            </div>

                        </div>

                    </Card>

                )

                :

                applications.length === 0

                ?

                (

                    <Card>

                        <div className="py-10 text-center">

                            <h2 className="text-xl font-semibold">

                                No Applications Yet

                            </h2>

                            <p className="mt-2 text-gray-500">

                                Start applying for jobs to see them here.

                            </p>

                        </div>

                    </Card>

                )

                :

                (

                    <div className="space-y-5">

                        {

                            applications.map(

                                (application) => (

                                    <Card

                                        key={application._id}

                                    >

                                        <div
                                            className="
                                                flex
                                                flex-col
                                                gap-5
                                                md:flex-row
                                                md:justify-between
                                                md:items-start
                                            "
                                        >

                                            <div className="flex-1">

                                                <h2 className="text-2xl font-bold text-gray-900">

                                                    {

                                                        application.job?.title

                                                    }

                                                </h2>

                                                <p className="mt-2 text-blue-600 font-semibold">

                                                    {

                                                        application.job?.company

                                                    }

                                                </p>

                                                <div
                                                    className="
                                                        mt-4
                                                        grid
                                                        gap-3
                                                        sm:grid-cols-2
                                                    "
                                                >

                                                    <p>

                                                        <span className="font-semibold">

                                                            Location:

                                                        </span>{" "}

                                                        {

                                                            application.job?.location

                                                        }

                                                    </p>

                                                    <p>

                                                        <span className="font-semibold">

                                                            Salary:

                                                        </span>{" "}

                                                        ₹{

                                                            Number(

                                                                application.job?.salary

                                                            ).toLocaleString("en-IN")

                                                        }

                                                    </p>

                                                </div>

                                                {

                                                    application.job?.description &&

                                                    (

                                                        <p className="mt-5 whitespace-pre-wrap leading-7 text-gray-600">

                                                            {

                                                                application.job.description

                                                            }

                                                        </p>

                                                    )

                                                }

                                            </div>

                                            <div
                                                className="
                                                    flex
                                                    flex-col
                                                    gap-3
                                                    items-start
                                                "
                                            >

                                                <p className="text-sm text-gray-500">

                                                    Application Status

                                                </p>

                                                {

                                                    getStatusBadge(

                                                        application.status

                                                    )

                                                }

                                                {

                                                    application.createdAt &&

                                                    (

                                                        <p className="mt-3 text-xs text-gray-500">

                                                            Applied on{" "}

                                                            {

                                                                new Date(

                                                                    application.createdAt

                                                                ).toLocaleDateString()

                                                            }

                                                        </p>

                                                    )

                                                }

                                        </div>

                                     </div>

                                     {renderTimeline(application.status)}

                                    </Card>

                                )

                            )

                        }

                    </div>

                )

            }

            {

                !loading &&

                applications.length > 0 &&

                totalPages > 1 &&

                (

                    <div
                        className="
                            mt-8
                            flex
                            items-center
                            justify-center
                            gap-4
                        "
                    >

                        <Button

                            variant="secondary"

                            disabled={page === 1}

                            onClick={() =>

                                setPage(

                                    previousPage =>

                                        previousPage - 1

                                )

                            }

                        >

                            Previous

                        </Button>

                        <span className="text-sm font-medium text-gray-600">

                            Page {page} of {totalPages}

                        </span>

                        <Button

                            variant="secondary"

                            disabled={page >= totalPages}

                            onClick={() =>

                                setPage(

                                    previousPage =>

                                        previousPage + 1

                                )

                            }

                        >

                            Next

                        </Button>

                    </div>

                )

            }

        </PageContainer>

    );

}

export default MyApplications;