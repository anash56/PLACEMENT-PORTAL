import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import PageContainer from "../components/ui/PageContainer";
import Button from "../components/ui/Button";
import AdminPageHeader from "../components/admin/AdminPageHeader";
import JobForm from "../components/admin/jobs/JobForm";
import { EMPTY_JOB_FORM, jobFormToPayload, validateJobForm } from "../utils/jobForm";

export default function CreateJob() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(EMPTY_JOB_FORM);
    const [saving, setSaving] = useState(false);

    const handleChange = event => {
        const { name, value } = event.target;
        setFormData(current => ({ ...current, [name]: value }));
    };

    const handleSubmit = async event => {
        event.preventDefault();
        const validationMessage = validateJobForm(formData);
        if (validationMessage) {
            toast.error(validationMessage);
            return;
        }

        try {
            setSaving(true);
            await api.post("/jobs", jobFormToPayload(formData));
            toast.success("Job posting created.");
            navigate("/admin/jobs", { replace: true });
        } catch (requestError) {
            toast.error(requestError.response?.data?.message || "Could not create the job posting.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <PageContainer>
            <AdminPageHeader
                title="Create a job"
                description="Add the role details and eligibility rules students will use to assess this opportunity."
                actions={<Button variant="secondary" onClick={() => navigate("/admin/jobs")} disabled={saving}>Back to jobs</Button>}
            />
            <div className="mx-auto max-w-4xl">
                <p className="mb-4 text-sm leading-6 text-slate-600">Fields marked * are required. Check the deadline and branch eligibility before publishing the opportunity.</p>
                <JobForm formData={formData} onChange={handleChange} onSubmit={handleSubmit} saving={saving} onCancel={() => navigate("/admin/jobs")} mode="create" />
            </div>
        </PageContainer>
    );
}
