import {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";
import toast from "react-hot-toast";

import api from "../services/api";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/TextArea";
import Card from "../components/ui/Card";
import PageContainer from "../components/ui/PageContainer";


function EditJob() {

    const { id } = useParams();

    const navigate = useNavigate();


    const [formData, setFormData] = useState({

        title: "",

        company: "",

        location: "",

        salary: "",

        description: "",

        minCgpa: "",

        allowedBranchesText: "",

        deadline: ""

    });


    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");


    useEffect(() => {

        fetchJob();

    }, [id]);


    const fetchJob = async () => {

        try {

            setLoading(true);

            setError("");


            const res = await api.get(

                `/jobs/${id}`

            );


            let formattedDeadline = "";
            if (res.data.deadline) {
                formattedDeadline = new Date(res.data.deadline).toISOString().split("T")[0];
            }

            setFormData({

                title: res.data.title ?? "",

                company: res.data.company ?? "",

                location: res.data.location ?? "",

                salary: res.data.salary ?? "",

                description: res.data.description ?? "",

                minCgpa: res.data.minCgpa ?? "",

                allowedBranchesText: res.data.allowedBranches ? res.data.allowedBranches.join(", ") : "",

                deadline: formattedDeadline

            });

        }

        catch (error) {

            console.log(
                error.response?.data
            );


            setError(

                error.response?.data?.message

                ||

                "Failed to load job."

            );

        }

        finally {

            setLoading(false);

        }

    };


    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setFormData((previousFormData) => ({

            ...previousFormData,

            [name]: value

        }));

    };


    const handleSubmit = async (e) => {

        e.preventDefault();


        try {

            setSaving(true);


            const allowedBranchesArray = formData.allowedBranchesText
                .split(",")
                .map((b) => b.trim())
                .filter((b) => b.length > 0);

            const payload = {
                title: formData.title,
                company: formData.company,
                location: formData.location,
                salary: Number(formData.salary),
                description: formData.description,
                minCgpa: formData.minCgpa === "" ? 0 : Number(formData.minCgpa),
                allowedBranches: allowedBranchesArray,
                deadline: formData.deadline || null
            };

            await api.patch(

                `/jobs/${id}`,

                payload

            );


            toast.success(
                "Job Updated Successfully"
            );


            navigate("/admin/jobs");

        }

        catch (error) {

            console.log(
                error.response?.data
            );


            toast.error(

                error.response?.data?.message

                ||

                "Update Failed"

            );
        }

        finally {

            setSaving(false);

        }

    };


    return (

        <PageContainer>

            <div className="mx-auto max-w-2xl">

                <div
                    className="
                        mb-6
                        flex
                        flex-col
                        gap-4
                        sm:flex-row
                        sm:items-start
                        sm:justify-between
                    "
                >

                    <div>

                        <h1 className="text-3xl font-bold text-gray-900">

                            Edit Job

                        </h1>


                        <p className="mt-2 text-sm text-gray-500">

                            Update the job opportunity information.

                        </p>

                    </div>


                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() =>
                            navigate("/admin/jobs")
                        }
                    >

                        Back to Jobs

                    </Button>

                </div>


                {
                    loading

                        ?

                        <Card>

                            <p className="text-center text-gray-500">

                                Loading job...

                            </p>

                        </Card>


                        :

                        error

                            ?

                            <Card>

                                <div className="py-6 text-center">

                                    <h2 className="text-lg font-semibold text-gray-900">

                                        Unable to Load Job

                                    </h2>


                                    <p className="mt-2 text-sm text-gray-500">

                                        {error}

                                    </p>


                                    <div
                                        className="
                                            mt-4
                                            flex
                                            justify-center
                                            gap-3
                                        "
                                    >

                                        <Button
                                            onClick={fetchJob}
                                        >

                                            Try Again

                                        </Button>


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

                            </Card>


                            :

                            <Card>

                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-5"
                                >

                                    <Input
                                        label="Job Title"
                                        type="text"
                                        name="title"
                                        placeholder="Example: Backend Developer"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                    />


                                    <Input
                                        label="Company"
                                        type="text"
                                        name="company"
                                        placeholder="Enter company name"
                                        value={formData.company}
                                        onChange={handleChange}
                                        required
                                    />


                                    <Input
                                        label="Location"
                                        type="text"
                                        name="location"
                                        placeholder="Example: Ahmedabad"
                                        value={formData.location}
                                        onChange={handleChange}
                                        required
                                    />


                                    <Input
                                        label="Salary"
                                        type="number"
                                        name="salary"
                                        placeholder="Enter annual salary"
                                        value={formData.salary}
                                        onChange={handleChange}
                                        required
                                    />


                                    <Textarea
                                        label="Description"
                                        name="description"
                                        placeholder="Enter job description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={6}
                                        required
                                    />

                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <Input
                                            label="Min CGPA"
                                            type="number"
                                            step="0.01"
                                            name="minCgpa"
                                            placeholder="e.g. 7.5"
                                            value={formData.minCgpa}
                                            onChange={handleChange}
                                        />
                                        <Input
                                            label="Allowed Branches (Comma separated)"
                                            type="text"
                                            name="allowedBranchesText"
                                            placeholder="e.g. Computer Science, IT"
                                            value={formData.allowedBranchesText}
                                            onChange={handleChange}
                                        />
                                        <Input
                                            label="Application Deadline"
                                            type="date"
                                            name="deadline"
                                            value={formData.deadline}
                                            onChange={handleChange}
                                        />
                                    </div>


                                    <div
                                        className="
                                            flex
                                            flex-col-reverse
                                            gap-3
                                            sm:flex-row
                                            sm:justify-end
                                        "
                                    >

                                        <Button
                                            type="button"
                                            variant="secondary"
                                            disabled={saving}
                                            onClick={() =>
                                                navigate("/admin/jobs")
                                            }
                                        >

                                            Cancel

                                        </Button>


                                        <Button
                                            type="submit"
                                            disabled={saving}
                                        >

                                            {
                                                saving
                                                    ? "Updating Job..."
                                                    : "Update Job"
                                            }

                                        </Button>

                                    </div>

                                </form>

                            </Card>

                }

            </div>

        </PageContainer>

    );

}


export default EditJob;