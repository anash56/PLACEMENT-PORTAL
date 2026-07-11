import {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import api from "../services/api";


import Button from "../components/ui/Button";
import toast from "react-hot-toast";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import PageContainer from "../components/ui/PageContainer";


function ManageJobs() {

    const navigate = useNavigate();


    const [jobs, setJobs] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [submittedSearch, setSubmittedSearch] =
        useState("");

    const [page, setPage] = useState(1);

    const [totalPages, setTotalPages] =
        useState(1);
    const [selectedJob, setSelectedJob] =
        useState(null);

    const [deleteLoading, setDeleteLoading] =
        useState(false);


    useEffect(() => {

        fetchJobs();

    }, [page, submittedSearch]);


    const fetchJobs = async () => {

        try {

            setLoading(true);


            const res = await api.get(

                `/jobs?keyword=${encodeURIComponent(
                    submittedSearch
                )}&page=${page}`

            );


            setJobs(res.data.jobs);

            setTotalPages(res.data.totalPages);

        }

        catch (error) {

            console.log(
                error.response?.data
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

    };

    const openDeleteModal = (jobId) => {

        setSelectedJob(jobId);

    };


    const confirmDeleteJob = async () => {

        if (!selectedJob) {

            return;

        }

        try {

            setDeleteLoading(true);

            await api.delete(

                `/jobs/${selectedJob}`

            );

            toast.success(
                "Job Deleted Successfully"
            );

            setSelectedJob(null);

            if (

                jobs.length === 1 &&

                page > 1

            ) {

                setPage(

                    previousPage =>

                        previousPage - 1

                );

            }

            else {

                fetchJobs();

            }

        }

        catch (error) {

            console.log(
                error.response?.data
            );

            toast.error(

                error.response?.data?.message ||

                "Delete Failed"

            );

        }

        finally {

            setDeleteLoading(false);

        }

    };


    return (

        <PageContainer>

            <div className="mb-8">

                <h1 className="text-3xl font-bold text-gray-900">

                    Manage Jobs

                </h1>


                <p className="mt-2 text-sm text-gray-500">

                    Search, review, update, and remove job opportunities.

                </p>

            </div>


            <Card className="mb-6">

                <form
                    onSubmit={handleSearch}
                    className="
                        flex
                        flex-col
                        gap-3
                        sm:flex-row
                        sm:items-end
                    "
                >

                    <div className="flex-1">

                        <Input
                            label="Search Jobs"
                            type="text"
                            placeholder="Search by title, company, or location"
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                    </div>


                    <Button
                        type="submit"
                        disabled={loading}
                    >

                        Search

                    </Button>

                </form>

            </Card>


            {
                loading

                    ?

                    <Card>

                        <p className="text-center text-gray-500">

                            Loading jobs...

                        </p>

                    </Card>


                    :

                    jobs.length === 0

                        ?

                        <Card>

                            <div className="py-8 text-center">

                                <h2 className="text-lg font-semibold text-gray-900">

                                    No Jobs Found

                                </h2>


                                <p className="mt-2 text-sm text-gray-500">

                                    No job opportunities match the current search.

                                </p>

                            </div>

                        </Card>


                        :

                        <div className="space-y-4">

                            {

                                jobs.map((job) => (

                                    <Card key={job._id}>

                                        <div
                                            className="
                                                flex
                                                flex-col
                                                gap-5
                                                lg:flex-row
                                                lg:items-start
                                                lg:justify-between
                                            "
                                        >

                                            <div className="min-w-0 flex-1">

                                                <h2 className="text-xl font-semibold text-gray-900">

                                                    {job.title}

                                                </h2>


                                                <p className="mt-1 text-sm font-medium text-blue-600">

                                                    {job.company}

                                                </p>


                                                <div
                                                    className="
                                                        mt-4
                                                        grid
                                                        gap-3
                                                        text-sm
                                                        text-gray-600
                                                        sm:grid-cols-2
                                                    "
                                                >

                                                    <p>

                                                        <span className="font-medium text-gray-900">

                                                            Location:{" "}

                                                        </span>

                                                        {job.location}

                                                    </p>


                                                    <p>

                                                        <span className="font-medium text-gray-900">

                                                            Salary:{" "}

                                                        </span>

                                                        ₹{Number(job.salary).toLocaleString("en-IN")}

                                                    </p>

                                                </div>


                                                <p
                                                    className="
                                                        mt-4
                                                        whitespace-pre-wrap
                                                        text-sm
                                                        leading-6
                                                        text-gray-600
                                                    "
                                                >

                                                    {job.description}

                                                </p>

                                            </div>


                                            <div
                                                className="
                                                    flex
                                                    shrink-0
                                                    flex-wrap
                                                    gap-2
                                                    lg:max-w-44
                                                    lg:flex-col
                                                "
                                            >

                                                <Button
                                                    variant="secondary"
                                                    onClick={() =>
                                                        navigate(
                                                            `/admin/jobs/${job._id}/applicants`
                                                        )
                                                    }
                                                    className="w-full"
                                                >

                                                    View Applicants

                                                </Button>


                                                <Button
                                                    variant="secondary"
                                                    onClick={() =>
                                                        navigate(
                                                            `/admin/jobs/${job._id}/edit`
                                                        )
                                                    }
                                                    className="w-full"
                                                >

                                                    Edit

                                                </Button>


                                                <Button
                                                    variant="danger"
                                                    onClick={() =>
                                                        openDeleteModal(job._id)
                                                    }
                                                    className="w-full"
                                                >

                                                    Delete

                                                </Button>

                                            </div>

                                        </div>

                                    </Card>

                                ))

                            }

                        </div>

            }


            {
                !loading
                &&
                jobs.length > 0
                &&
                totalPages > 1
                &&
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
                                setPage((previousPage) =>
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
                                setPage((previousPage) =>
                                    previousPage + 1
                                )
                            }
                        >

                            Next

                        </Button>

                    </div>

                )
            }

            <ConfirmationModal

                open={selectedJob !== null}

                title="Delete Job"

                message="This action cannot be undone."

                loading={deleteLoading}

                onCancel={() =>

                    setSelectedJob(null)

                }

                onConfirm={confirmDeleteJob}

            />

        </PageContainer>

    );

}


export default ManageJobs;