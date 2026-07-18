import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";

import PageContainer from "../components/ui/PageContainer";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

function Jobs() {

    const navigate = useNavigate();

    const {
        isAuthenticated,
        isAdmin
    } = useAuth();

    const [jobs, setJobs] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [submittedSearch, setSubmittedSearch] = useState("");

    const [location, setLocation] = useState("");

    const [submittedLocation, setSubmittedLocation] = useState("");

    const [sort, setSort] = useState("latest");

    const [page, setPage] = useState(1);

    const [totalPages, setTotalPages] = useState(1);

    const [
        applyingJobId,
        setApplyingJobId
    ] = useState(null);

    const [error, setError] = useState("");
    const [appliedJobIds, setAppliedJobIds] = useState([]);

    useEffect(() => {

        fetchJobs();

    }, [page, submittedSearch, submittedLocation, sort]);

    useEffect(() => {
        if (isAuthenticated && !isAdmin) {
            fetchAppliedJobs();
        } else {
            setAppliedJobIds([]);
        }
    }, [isAuthenticated, isAdmin]);

    const fetchAppliedJobs = async () => {
        try {
            const res = await api.get("/applications/my?limit=1000");
            const ids = (res.data.applications || [])
                .filter((app) => app.job !== null && app.job !== undefined)
                .map((app) => app.job._id);
            setAppliedJobIds(ids);
        } catch (err) {
            console.error("Failed to fetch applied jobs:", err);
        }
    };

    const fetchJobs = async () => {

        try {

            setLoading(true);

            setError("");

            const res = await api.get(

                `/jobs?keyword=${encodeURIComponent(
                    submittedSearch
                )}&location=${encodeURIComponent(
                    submittedLocation
                )}&sort=${sort}&page=${page}`

            );

            setJobs(res.data.jobs);

            setTotalPages(
                res.data.totalPages
            );

        }

        catch (error) {

            console.log(error);

            setError(

                error.response?.data?.message ||

                "Failed to load jobs."

            );

        }

        finally {

            setLoading(false);

        }

    };

    const handleSearch = (e) => {

        e.preventDefault();

        setPage(1);

        setSubmittedSearch(search);

        setSubmittedLocation(location);

    };

    const handleClearFilters = () => {

        setSearch("");

        setSubmittedSearch("");

        setLocation("");

        setSubmittedLocation("");

        setSort("latest");

        setPage(1);

    };

    const applyJob = async (jobId) => {

        try {

            setApplyingJobId(jobId);

            await api.post(

                `/applications/${jobId}`,

                {}

            );

           toast.success("Applied Successfully");
           setAppliedJobIds((prev) => [...prev, jobId]);

        }

        catch (error) {

            console.log(error);

            toast.error(

                error.response?.data?.message ||

                "Application Failed"

            );

        }

        finally {

            setApplyingJobId(null);

        }

    };

    return (

        <PageContainer>

            <div className="mb-8">

                <h1 className="text-3xl font-bold text-gray-900">

                    Available Jobs

                </h1>

                <p className="mt-2 text-sm text-gray-500">

                    Browse the latest placement opportunities.

                </p>

            </div>

            <Card className="mb-6">

                <form

                    onSubmit={handleSearch}

                    className="
                        grid
                        gap-4
                        sm:grid-cols-2
                        lg:grid-cols-4
                        items-end
                    "

                >

                    <div>

                        <Input

                            label="Search Jobs"

                            placeholder="Search by title or company"

                            value={search}

                            onChange={(e) =>
                                setSearch(
                                    e.target.value
                                )
                            }

                        />

                    </div>

                    <div>

                        <Input

                            label="Location"

                            placeholder="Search by city or country"

                            value={location}

                            onChange={(e) =>
                                setLocation(
                                    e.target.value
                                )
                            }

                        />

                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Sort By
                        </label>
                        <select
                            value={sort}
                            onChange={(e) => {
                                setPage(1);
                                setSort(e.target.value);
                            }}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        >
                            <option value="latest">Latest Jobs</option>
                            <option value="salary">Salary: High to Low</option>
                        </select>
                    </div>

                    <div className="flex gap-2">

                        <Button type="submit" className="flex-1">

                            Search

                        </Button>

                        {(submittedSearch || submittedLocation || sort !== "latest") && (
                            <Button 
                                type="button" 
                                variant="secondary" 
                                onClick={handleClearFilters}
                            >
                                Reset
                            </Button>
                        )}

                    </div>

                </form>

            </Card>

            {

                loading

                ?

                (

                    <div className="space-y-5">
                        {[1, 2, 3].map((n) => (
                            <Card key={n} className="animate-pulse">
                                <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
                                    <div className="flex-1 space-y-4">
                                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                                        <div className="h-4 bg-blue-200 rounded w-1/4"></div>
                                        <div className="grid gap-3 sm:grid-cols-2 mt-4">
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                        <div className="h-20 bg-gray-200 rounded w-full mt-5"></div>
                                    </div>
                                    <div className="h-10 bg-gray-200 rounded w-full lg:w-48 self-start"></div>
                                </div>
                            </Card>
                        ))}
                    </div>

                )

                :

                error

                ?

                (

                    <Card>

                        <div className="py-10 text-center">

                            <h2 className="text-xl font-semibold">

                                Failed To Load Jobs

                            </h2>

                            <p className="mt-2 text-gray-500">

                                {error}

                            </p>

                            <div className="mt-5">

                                <Button

                                    onClick={fetchJobs}

                                >

                                    Try Again

                                </Button>

                            </div>

                        </div>

                    </Card>

                )

                :

                jobs.length === 0

                ?

                (

                    <Card>

                        <div className="py-10 text-center">

                            <h2 className="text-xl font-semibold">

                                No Jobs Found

                            </h2>

                            <p className="mt-2 text-gray-500">

                                Try another search.

                            </p>

                        </div>

                    </Card>

                )

                :

                (

                    <div className="space-y-5">

                        {

                            jobs.map((job) => {

                                const applying =

                                    applyingJobId === job._id;

                                return (

                                    <Card

                                        key={job._id}

                                    >

                                        <div

                                            className="
                                                flex
                                                flex-col
                                                gap-5
                                                lg:flex-row
                                                lg:justify-between
                                            "

                                        >

                                            <div className="flex-1">

                                                <h2 className="text-2xl font-bold text-gray-900">

                                                    {job.title}

                                                </h2>

                                                <p className="mt-1 text-blue-600 font-semibold">

                                                    {job.company}

                                                </p>

                                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                    <p>

                                                        <span className="font-semibold text-gray-900">

                                                            Location:

                                                        </span>{" "}

                                                        {job.location}

                                                    </p>

                                                    <p>

                                                        <span className="font-semibold text-gray-900">

                                                            Salary:

                                                        </span>{" "}

                                                        ₹{Number(job.salary).toLocaleString("en-IN")}

                                                    </p>

                                                    {job.minCgpa !== undefined && job.minCgpa > 0 && (
                                                        <p>
                                                            <span className="font-semibold text-gray-900">
                                                                Min CGPA:
                                                            </span>{" "}
                                                            {job.minCgpa}
                                                        </p>
                                                    )}

                                                    {job.deadline && (
                                                        <p>
                                                            <span className="font-semibold text-gray-900">
                                                                Deadline:
                                                            </span>{" "}
                                                            {new Date(job.deadline).toLocaleDateString("en-IN", {
                                                                day: "numeric",
                                                                month: "short",
                                                                year: "numeric"
                                                            })}
                                                        </p>
                                                    )}

                                                    {job.allowedBranches && job.allowedBranches.length > 0 && (
                                                        <p className="sm:col-span-2">
                                                            <span className="font-semibold text-gray-900">
                                                                Allowed Branches:
                                                            </span>{" "}
                                                            {job.allowedBranches.join(", ")}
                                                        </p>
                                                    )}

                                                </div>

                                                <p className="mt-5 whitespace-pre-wrap leading-7 text-gray-600">

                                                    {job.description}

                                                </p>

                                            </div>

                                            <div
                                                className="
                                                    flex
                                                    flex-wrap
                                                    gap-2
                                                    lg:w-48
                                                    lg:flex-col
                                                "
                                            >

                                                {

                                                    !isAuthenticated

                                                    ?

                                                    (

                                                        <Button

                                                            className="w-full"

                                                            onClick={() =>

                                                                navigate("/login")

                                                            }

                                                        >

                                                            Login To Apply

                                                        </Button>

                                                    )

                                                    :

                                                    isAdmin

                                                    ?

                                                    (

                                                        <Button

                                                            variant="secondary"

                                                            className="w-full"

                                                            onClick={() =>

                                                                navigate(

                                                                    `/admin/jobs/${job._id}/applicants`

                                                                )

                                                            }

                                                        >

                                                            View Applicants

                                                        </Button>

                                                    )

                                                    :

                                                    (

                                                        <Button

                                                            className="w-full"

                                                            disabled={applying || appliedJobIds.includes(job._id)}

                                                            onClick={() =>

                                                                applyJob(job._id)

                                                            }

                                                        >

                                                            {

                                                                applying

                                                                ?

                                                                "Applying..."

                                                                :

                                                                appliedJobIds.includes(job._id)

                                                                ?

                                                                "Applied"

                                                                :

                                                                "Apply Now"

                                                            }

                                                        </Button>

                                                    )

                                                }

                                            </div>

                                        </div>

                                    </Card>

                                );

                            })

                        }

                    </div>

                )

            }

            {

                !loading &&

                jobs.length > 0 &&

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

export default Jobs;