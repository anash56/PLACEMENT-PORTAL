import {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import api from "../services/api";
import toast from "react-hot-toast";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import PageContainer from "../components/ui/PageContainer";


function Applicants() {

    const { jobId } = useParams();

    const navigate = useNavigate();


    const [applicants, setApplicants] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [
        updatingApplicationId,
        setUpdatingApplicationId
    ] = useState(null);


    useEffect(() => {

        fetchApplicants();

    }, [jobId]);


    const fetchApplicants = async () => {

        try {

            setLoading(true);

            setError("");


            const res = await api.get(

                `/applications/job/${jobId}`

            );


            setApplicants(res.data);

        }

        catch (error) {

            console.log(
                error.response?.data
            );


            setError(

                error.response?.data?.message

                ||

                "Failed to load applicants."

            );

        }

        finally {

            setLoading(false);

        }

    };

    const downloadCSV = () => {
        if (!applicants || applicants.length === 0) {
            toast.error("No applicants to export.");
            return;
        }

        // CSV Headers
        const headers = [
            "Student Name",
            "Student Email",
            "Branch",
            "CGPA",
            "Graduation Year",
            "Contact Number",
            "Skills",
            "Application Status",
            "Applied Date"
        ];

        // Format rows
        const rows = applicants.map((app) => {
            const student = app.student || {};
            const skillsStr = student.skills ? student.skills.join("; ") : "";
            const appliedDate = app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "";
            
            return [
                student.name || "Unknown Student",
                student.email || "",
                student.branch || "Unspecified",
                student.cgpa !== undefined ? student.cgpa : "",
                student.graduationYear || "",
                student.contactNumber || "",
                skillsStr,
                app.status,
                appliedDate
            ];
        });

        // Combine into CSV string (escape commas and double quotes)
        const csvContent = [
            headers.join(","),
            ...rows.map((row) => 
                row.map((field) => {
                    const escapedField = String(field).replace(/"/g, '""');
                    return `"${escapedField}"`;
                }).join(",")
            )
        ].join("\n");

        // Create download link and trigger click
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Applicants_Job_${jobId}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    const updateStatus = async (
        applicationId,
        status
    ) => {

        try {

            setUpdatingApplicationId(
                applicationId
            );


            await api.patch(

                `/applications/${applicationId}`,

                {
                    status
                }

            );


            setApplicants(
                (previousApplicants) =>

                    previousApplicants.map(
                        (application) =>

                            application._id
                                === applicationId

                                ?

                                {
                                    ...application,
                                    status
                                }

                                :

                                application
                    )
            );

            toast.success("Application Status Updated");

        }

        catch (error) {

            console.log(
                error.response?.data
            );


            toast.error(

                error.response?.data?.message

                ||

                "Status Update Failed"

            );

        }

        finally {

            setUpdatingApplicationId(null);

        }

    };


    return (

        <PageContainer>

            <div
                className="
                    mb-8
                    flex
                    flex-col
                    gap-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                "
            >

                <div>

                    <h1 className="text-3xl font-bold text-gray-900">

                        Applicants

                    </h1>


                    <p className="mt-2 text-sm text-gray-500">

                        Review applicants and update their application status.

                    </p>

                </div>


                <div className="flex gap-2">
                    {applicants.length > 0 && (
                        <Button
                            onClick={downloadCSV}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            Export to CSV
                        </Button>
                    )}
                    <Button
                        variant="secondary"
                        onClick={() =>
                            navigate("/admin/jobs")
                        }
                    >

                        Back to Jobs

                    </Button>
                </div>

            </div>


            {
                loading

                    ?

                    <div className="space-y-4">
                        {[1, 2].map((n) => (
                            <Card key={n} className="animate-pulse">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex-1 space-y-3">
                                        <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                        <div className="flex gap-4 mt-2">
                                            <div className="h-4 bg-gray-100 rounded w-20"></div>
                                            <div className="h-4 bg-gray-100 rounded w-20"></div>
                                        </div>
                                    </div>
                                    <div className="h-10 bg-gray-200 rounded w-full sm:w-56"></div>
                                </div>
                            </Card>
                        ))}
                    </div>


                    :

                    error

                        ?

                        <Card>

                            <div className="py-6 text-center">

                                <h2 className="text-lg font-semibold text-gray-900">

                                    Unable to Load Applicants

                                </h2>


                                <p className="mt-2 text-sm text-gray-500">

                                    {error}

                                </p>


                                <div className="mt-4">

                                    <Button
                                        onClick={fetchApplicants}
                                    >

                                        Try Again

                                    </Button>

                                </div>

                            </div>

                        </Card>


                        :

                        applicants.length === 0

                            ?

                            <Card>

                                <div className="py-8 text-center">

                                    <h2 className="text-lg font-semibold text-gray-900">

                                        No Applicants Yet

                                    </h2>


                                    <p className="mt-2 text-sm text-gray-500">

                                        No students have applied for this job.

                                    </p>

                                </div>

                            </Card>


                            :

                            <div className="space-y-4">

                                {

                                    applicants.map(
                                        (application) => {

                                            const isUpdating =

                                                updatingApplicationId
                                                === application._id;


                                            return (

                                                <Card
                                                    key={application._id}
                                                >

                                                    <div
                                                        className="
                                                            flex
                                                            flex-col
                                                            gap-5
                                                            sm:flex-row
                                                            sm:items-center
                                                            sm:justify-between
                                                        "
                                                    >

                                                         <div className="min-w-0 flex-1">

                                                             <h2 className="text-lg font-semibold text-gray-900">

                                                                 {

                                                                     application

                                                                         .student

                                                                         ?.name

                                                                     ||

                                                                     "Unknown Student"

                                                                 }

                                                             </h2>


                                                             <p className="mt-0.5 text-sm text-gray-500">

                                                                 {

                                                                     application

                                                                         .student

                                                                         ?.email

                                                                     ||

                                                                     "Email unavailable"

                                                                 }

                                                             </p>


                                                             {/* Student Profile Snapshot */}
                                                             {application.student?.cgpa !== undefined && application.student?.branch && (
                                                                 <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                                                                     <p>
                                                                         <span className="font-semibold text-gray-900">Branch:</span>{" "}
                                                                         {application.student.branch}
                                                                     </p>
                                                                     <p>
                                                                         <span className="font-semibold text-gray-900">CGPA:</span>{" "}
                                                                         {application.student.cgpa} / 10.0
                                                                     </p>
                                                                     {application.student.graduationYear && (
                                                                         <p>
                                                                             <span className="font-semibold text-gray-900">Batch:</span>{" "}
                                                                             {application.student.graduationYear}
                                                                         </p>
                                                                     )}
                                                                 </div>
                                                             )}

                                                             {application.student?.contactNumber && (
                                                                 <p className="mt-1 text-sm text-gray-600">
                                                                     <span className="font-semibold text-gray-900">Phone:</span>{" "}
                                                                     {application.student.contactNumber}
                                                                 </p>
                                                             )}

                                                             {/* Skills tags */}
                                                             {application.student?.skills && application.student.skills.length > 0 && (
                                                                 <div className="mt-2.5 flex flex-wrap gap-1">
                                                                     {application.student.skills.map((skill, index) => (
                                                                         <span
                                                                             key={index}
                                                                             className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                                                                         >
                                                                             {skill}
                                                                         </span>
                                                                     ))}
                                                                 </div>
                                                             )}

                                                             {/* Resume Link */}
                                                             <div className="mt-4">
                                                                 {application.student?.resumeUrl ? (
                                                                     <a
                                                                         href={application.student.resumeUrl}
                                                                         target="_blank"
                                                                         rel="noopener noreferrer"
                                                                         className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                                                                     >
                                                                         <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                         </svg>
                                                                         View PDF Resume
                                                                     </a>
                                                                 ) : (
                                                                     <span className="inline-flex items-center gap-1 rounded bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 border border-yellow-100">
                                                                         No resume uploaded
                                                                     </span>
                                                                 )}
                                                             </div>

                                                         </div>


                                                        <div className="w-full sm:w-56">

                                                            <label
                                                                htmlFor={
                                                                    `status-${application._id}`
                                                                }
                                                                className="
                                                                    mb-2
                                                                    block
                                                                    text-sm
                                                                    font-medium
                                                                    text-gray-700
                                                                "
                                                            >

                                                                Application Status

                                                            </label>


                                                            <select
                                                                id={
                                                                    `status-${application._id}`
                                                                }
                                                                value={
                                                                    application.status
                                                                }
                                                                disabled={
                                                                    isUpdating
                                                                }
                                                                onChange={(e) =>

                                                                    updateStatus(

                                                                        application._id,

                                                                        e.target.value

                                                                    )

                                                                }
                                                                className="
                                                                    w-full
                                                                    rounded-lg
                                                                    border
                                                                    border-gray-300
                                                                    bg-white
                                                                    px-3
                                                                    py-2
                                                                    text-sm
                                                                    outline-none
                                                                    transition
                                                                    focus:border-blue-500
                                                                    focus:ring-2
                                                                    focus:ring-blue-200
                                                                    disabled:cursor-not-allowed
                                                                    disabled:opacity-60
                                                                "
                                                            >

                                                                <option value="Pending">

                                                                    Pending

                                                                </option>


                                                                <option value="Test Scheduled">

                                                                    Test Scheduled

                                                                </option>


                                                                <option value="Interview Scheduled">

                                                                    Interview Scheduled

                                                                </option>


                                                                <option value="Shortlisted">

                                                                    Shortlisted

                                                                </option>


                                                                <option value="Offered">

                                                                    Offered

                                                                </option>


                                                                <option value="Rejected">

                                                                    Rejected

                                                                </option>

                                                            </select>


                                                            {
                                                                isUpdating
                                                                &&
                                                                (

                                                                    <p className="mt-2 text-xs text-gray-500">

                                                                        Updating status...

                                                                    </p>

                                                                )
                                                            }

                                                        </div>

                                                    </div>

                                                </Card>

                                            );

                                        }
                                    )

                                }

                            </div>

            }

        </PageContainer>

    );

}


export default Applicants;