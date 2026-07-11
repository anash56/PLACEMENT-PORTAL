import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../services/api";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Card from "../components/ui/Card";
import PageContainer from "../components/ui/PageContainer";

function CreateJob() {

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

    const [loading, setLoading] = useState(false);

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

            setLoading(true);

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

            await api.post(

                "/jobs",

                payload

            );

            toast.success(

                "Job Created Successfully"

            );

            navigate("/admin/jobs");

        }

        catch (error) {

            console.log(
                error.response?.data
            );

            toast.error(

                error.response?.data?.message ||

                "Failed To Create Job"

            );

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <PageContainer>

            <div className="mx-auto max-w-2xl">

                <div className="mb-6">

                    <h1 className="text-3xl font-bold text-gray-900">

                        Create Job

                    </h1>

                    <p className="mt-2 text-sm text-gray-500">

                        Add a new job opportunity to the placement portal.

                    </p>

                </div>

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

                        <div className="flex justify-end gap-3">

                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() =>
                                    navigate("/admin/jobs")
                                }
                            >

                                Cancel

                            </Button>

                            <Button
                                type="submit"
                                disabled={loading}
                            >

                                {

                                    loading

                                        ?

                                        "Creating Job..."

                                        :

                                        "Create Job"

                                }

                            </Button>

                        </div>

                    </form>

                </Card>

            </div>

        </PageContainer>

    );

}

export default CreateJob;