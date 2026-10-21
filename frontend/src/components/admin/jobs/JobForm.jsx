import Button from "../../ui/Button";
import Input from "../../ui/Input";
import Textarea from "../../ui/TextArea";
import Card from "../../ui/Card";

export default function JobForm({ formData, onChange, onSubmit, saving, mode = "create", onCancel }) {
    const isEdit = mode === "edit";

    return (
        <Card className="!p-5 sm:!p-7">
            <form onSubmit={onSubmit} className="space-y-7" noValidate>
                <fieldset className="space-y-4">
                    <legend className="mb-4 flex items-center gap-2 text-sm font-extrabold text-slate-800">
                        <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-xs font-extrabold text-slate-700">01</span>
                        Opportunity details
                    </legend>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Input label="Job title *" name="title" type="text" maxLength={200} placeholder="e.g. Backend Developer" value={formData.title} onChange={onChange} required autoComplete="off" />
                        <Input label="Company *" name="company" type="text" maxLength={200} placeholder="Company name" value={formData.company} onChange={onChange} required />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Input label="Location *" name="location" type="text" maxLength={200} placeholder="e.g. Ahmedabad / Remote" value={formData.location} onChange={onChange} required />
                        <Input label="Annual salary (₹) *" name="salary" type="number" min="0" step="any" placeholder="e.g. 600000" value={formData.salary} onChange={onChange} required />
                    </div>
                    <Textarea label="Job description *" name="description" maxLength={20000} placeholder="Responsibilities, requirements, and role details" value={formData.description} onChange={onChange} rows={6} required />
                </fieldset>

                <div className="h-px bg-slate-100" />

                <fieldset className="space-y-4">
                    <legend className="mb-4 flex items-center gap-2 text-sm font-extrabold text-slate-800">
                        <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-xs font-extrabold text-slate-700">02</span>
                        Eligibility and deadline
                    </legend>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Input label="Minimum CGPA (0–10)" name="minCgpa" type="number" min="0" max="10" step="0.01" placeholder="e.g. 7.5" value={formData.minCgpa} onChange={onChange} />
                        <Input label="Application deadline" name="deadline" type="date" value={formData.deadline} onChange={onChange} />
                    </div>
                    <Input label="Allowed branches (comma-separated)" name="allowedBranchesText" type="text" placeholder="e.g. Information Technology, Computer Engineering" value={formData.allowedBranchesText} onChange={onChange} />
                    <p className="text-xs leading-5 text-slate-500">Leave the branch list empty to allow all branches. Use branch names that match student profiles.</p>
                </fieldset>

                <div className="h-px bg-slate-100" />

                <fieldset className="space-y-3">
                    <legend className="mb-2 flex items-center gap-2 text-sm font-extrabold text-slate-800">
                        <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-xs font-extrabold text-[#245e9b]">03</span>
                        Hiring stages <span className="font-semibold text-slate-400">(optional)</span>
                    </legend>
                    <Textarea
                        label="Selection stages, in order"
                        name="selectionStagesText"
                        value={formData.selectionStagesText || ""}
                        onChange={onChange}
                        rows={4}
                        maxLength={1100}
                        placeholder={"Resume review\nOnline assessment\nTechnical interview\nHR interview"}
                    />
                    <p className="text-xs leading-5 text-slate-500">
                        Enter one stage per line, in the order used for this job. You can define up to 12 stages. Leave this empty if you only want to track the overall application status. These stages are informational; admins update them when an actual step occurs.
                    </p>
                </fieldset>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                    <Button type="button" variant="secondary" onClick={onCancel} disabled={saving} className="sm:min-w-28">Cancel</Button>
                    <Button type="submit" disabled={saving} className="sm:min-w-40">
                        {saving ? (isEdit ? "Saving changes…" : "Creating job…") : (isEdit ? "Save changes" : "Create job")}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
