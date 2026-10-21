import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import PageContainer from "../components/ui/PageContainer";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import AdminPageHeader from "../components/admin/AdminPageHeader";
import JobForm from "../components/admin/jobs/JobForm";
import { jobFormToPayload, jobToForm, validateJobForm } from "../utils/jobForm";

export default function EditJob() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const fetchJob = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const { data } = await api.get(`/jobs/${id}`);
            setFormData(jobToForm(data.job || data));
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not load this job posting.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchJob();
    }, [fetchJob]);

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
            await api.patch(`/jobs/${id}`, jobFormToPayload(formData));
            toast.success("Job posting updated.");
            navigate("/admin/jobs", { replace: true });
        } catch (requestError) {
            toast.error(requestError.response?.data?.message || "Could not save your changes.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <PageContainer>
            <AdminPageHeader
                title="Edit job"
                description="Keep opportunity information and eligibility rules accurate for students."
                actions={<Button variant="secondary" onClick={() => navigate("/admin/jobs")} disabled={saving}>Back to jobs</Button>}
            />
            <div className="mx-auto max-w-4xl">
                {loading ? (
                    <Card className="!p-7" aria-busy="true"><div className="animate-pulse space-y-4"><div className="h-5 w-1/3 rounded bg-slate-100" /><div className="h-11 rounded-lg bg-slate-50" /><div className="h-11 rounded-lg bg-slate-50" /><div className="h-28 rounded-lg bg-slate-50" /></div></Card>
                ) : error ? (
                    <Card className="!p-6 text-center">
                        <h2 className="text-lg font-extrabold text-slate-900">Unable to load job</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{error}</p>
                        <div className="mt-5 flex justify-center gap-2"><Button variant="secondary" onClick={() => navigate("/admin/jobs")}>Back to jobs</Button><Button onClick={fetchJob}>Try again</Button></div>
                    </Card>
                ) : formData ? (
                    <JobForm formData={formData} onChange={handleChange} onSubmit={handleSubmit} saving={saving} onCancel={() => navigate("/admin/jobs")} mode="edit" />
                ) : null}
            </div>
        </PageContainer>
    );
}
