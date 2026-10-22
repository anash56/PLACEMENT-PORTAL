import { useCallback, useEffect, useRef, useState } from "react";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import Textarea from "../../ui/TextArea";
import Card from "../../ui/Card";

const MAX_WORKFLOW_STAGES = 12;
const MAX_STAGE_LENGTH = 80;

const WORKFLOW_TEMPLATES = [
    { value: "review-interview", label: "Resume review and interview", stages: ["Resume review", "Interview"] },
    { value: "assessment-interviews", label: "Assessment and interviews", stages: ["Resume review", "Online assessment", "Technical interview", "HR interview"] },
    { value: "technical-rounds", label: "Multi-round technical hiring", stages: ["Resume review", "Coding assessment", "Technical interview 1", "Technical interview 2", "HR interview"] },
    { value: "internship", label: "Internship selection", stages: ["Resume review", "Task assessment", "Interview"] },
];

const RESERVED_STATUSES = ["Submitted", "Selected", "Rejected", "Withdrawn"];

export default function JobForm({ formData, onChange, onSubmit, saving, mode = "create", onCancel }) {
    const isEdit = mode === "edit";
    const nextStageId = useRef(1);
    const lastWrittenText = useRef(String(formData.selectionStagesText || ""));
    const createRows = useCallback(value => String(value || "")
        .split(String(value || "").includes("\n") ? /\r?\n/ : ",")
        .map(stage => stage.trim())
        .filter(Boolean)
        .map(name => ({ id: nextStageId.current++, name })), []);
    const [stageRows, setStageRows] = useState(() => createRows(formData.selectionStagesText));
    const [templateChoice, setTemplateChoice] = useState("");

    // Sync only when the parent changes the workflow from outside this editor (for example,
    // when a saved job is loaded). Local typing, including a temporarily blank row, is preserved.
    useEffect(() => {
        const incoming = String(formData.selectionStagesText || "");
        if (incoming !== lastWrittenText.current) {
            lastWrittenText.current = incoming;
            setStageRows(createRows(incoming));
        }
    }, [formData.selectionStagesText, createRows]);

    const publishRows = nextRows => {
        setStageRows(nextRows);
        const serialized = nextRows.map(row => row.name).join("\n");
        lastWrittenText.current = serialized;
        onChange({ target: { name: "selectionStagesText", value: serialized } });
    };

    const applyTemplate = event => {
        const value = event.target.value;
        setTemplateChoice("");
        if (!value) return;
        if (value === "no-stages") {
            publishRows([]);
            return;
        }
        const template = WORKFLOW_TEMPLATES.find(item => item.value === value);
        if (template) publishRows(template.stages.map(name => ({ id: nextStageId.current++, name })));
    };

    const updateStage = (id, name) => publishRows(stageRows.map(row => row.id === id ? { ...row, name } : row));
    const moveStage = (index, offset) => {
        const target = index + offset;
        if (target < 0 || target >= stageRows.length) return;
        const next = [...stageRows];
        [next[index], next[target]] = [next[target], next[index]];
        publishRows(next);
    };
    const removeStage = id => publishRows(stageRows.filter(row => row.id !== id));
    const addStage = () => {
        if (stageRows.length >= MAX_WORKFLOW_STAGES) return;
        publishRows([...stageRows, { id: nextStageId.current++, name: "" }]);
    };

    const validStageCount = stageRows.filter(row => row.name.trim()).length;
    const visibleStageNames = stageRows.map(row => row.name.trim()).filter(Boolean);

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
                    <p className="text-xs leading-5 text-slate-600">Leave the branch list empty to allow all branches. Use branch names that match student profiles.</p>
                </fieldset>

                <div className="h-px bg-slate-100" />

                <fieldset className="space-y-4">
                    <legend className="mb-2 flex flex-wrap items-center gap-2 text-sm font-extrabold text-slate-800">
                        <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-xs font-extrabold text-[#245e9b]">03</span>
                        Hiring workflow <span className="font-semibold text-slate-500">(optional)</span>
                    </legend>
                    <p className="text-sm leading-6 text-slate-600">
                        Build the selection process for this job. Students start at Submitted; authorized admins record each real stage as the application progresses.
                    </p>

                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                        <div className="min-w-0">
                            <label htmlFor="workflow-template" className="mb-2 block text-sm font-semibold text-slate-700">Start with a template</label>
                            <select
                                id="workflow-template"
                                value={templateChoice}
                                onChange={applyTemplate}
                                className="min-h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            >
                                <option value="">Choose a starter template…</option>
                                <option value="no-stages">No custom stages (direct decision)</option>
                                {WORKFLOW_TEMPLATES.map(template => <option key={template.value} value={template.value}>{template.label}</option>)}
                            </select>
                        </div>
                        <Button type="button" variant="secondary" onClick={addStage} disabled={stageRows.length >= MAX_WORKFLOW_STAGES} className="w-full sm:w-auto">
                            <span aria-hidden="true" className="text-base leading-none">+</span> Add stage
                        </Button>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/70">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3">
                            <div>
                                <h3 className="text-sm font-extrabold text-slate-800">Your hiring stages</h3>
                                <p className="mt-0.5 text-xs text-slate-600">Use the arrows to set the order.</p>
                            </div>
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700">{validStageCount}/{MAX_WORKFLOW_STAGES}</span>
                        </div>

                        {stageRows.length > 0 ? (
                            <ol className="space-y-2 p-3 sm:p-4" aria-label="Configured hiring stages">
                                {stageRows.map((row, index) => (
                                    <li key={row.id} className="grid min-w-0 grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm sm:grid-cols-[32px_minmax(0,1fr)_auto] sm:gap-3 sm:p-3">
                                        <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-xs font-extrabold tabular-nums text-[#245e9b]">{index + 1}</span>
                                        <input
                                            type="text"
                                            value={row.name}
                                            onChange={event => updateStage(row.id, event.target.value)}
                                            maxLength={MAX_STAGE_LENGTH}
                                            aria-label={`Workflow stage ${index + 1}`}
                                            placeholder={`e.g. ${index === 0 ? "Resume review" : "Technical interview"}`}
                                            className="min-h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                        />
                                        <div className="flex items-center gap-1">
                                            <button type="button" onClick={() => moveStage(index, -1)} disabled={index === 0} aria-label={`Move stage ${index + 1} up`} title="Move up" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#245e9b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-35">↑</button>
                                            <button type="button" onClick={() => moveStage(index, 1)} disabled={index === stageRows.length - 1} aria-label={`Move stage ${index + 1} down`} title="Move down" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#245e9b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-35">↓</button>
                                            <button type="button" onClick={() => removeStage(row.id)} aria-label={`Remove stage ${index + 1}`} title="Remove stage" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-lg leading-none text-slate-600 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">×</button>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <div className="px-5 py-7 text-center">
                                <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-lg font-semibold text-[#245e9b]" aria-hidden="true">↗</span>
                                <p className="mt-3 text-sm font-bold text-slate-800">No custom stages configured</p>
                                <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-600">Applications can move from Submitted directly to a final outcome, or you can add stages for this job.</p>
                            </div>
                        )}
                    </div>

                    <p className="text-xs leading-5 text-slate-600">
                        Add up to {MAX_WORKFLOW_STAGES} stages, each up to {MAX_STAGE_LENGTH} characters. Submitted, Selected, Rejected, Withdrawn, and Offered are reserved portal statuses and cannot be custom stages.
                    </p>

                    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                                <h3 className="text-sm font-extrabold text-[#173e70]">Workflow preview</h3>
                                <p className="mt-1 text-xs leading-5 text-slate-600">This is the workflow new applicants will receive.</p>
                            </div>
                            <span className="rounded-full border border-blue-100 bg-white px-2.5 py-1 text-xs font-bold text-[#245e9b]">{visibleStageNames.length + 1} stages</span>
                        </div>
                        <ol className="mt-3 grid gap-2 sm:grid-cols-2">
                            {["Submitted", ...visibleStageNames].map((stage, index) => (
                                <li key={`${stage}-${index}`} className="flex min-w-0 items-center gap-2 rounded-xl border border-blue-100 bg-white px-3 py-2.5">
                                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-50 text-[10px] font-extrabold tabular-nums text-[#245e9b]">{index + 1}</span>
                                    <span className="min-w-0 break-words text-xs font-bold text-slate-800">{stage}</span>
                                </li>
                            ))}
                        </ol>
                        <div className="mt-3 border-t border-blue-100 pt-3">
                            <p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-600">Final outcomes available to every job</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {RESERVED_STATUSES.slice(1).map(status => (
                                    <span key={status} className={`rounded-full border px-2.5 py-1 text-xs font-bold ${status === "Selected" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : status === "Rejected" ? "border-rose-200 bg-rose-50 text-rose-800" : "border-slate-200 bg-slate-100 text-slate-700"}`}>{status}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {isEdit && <p className="rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-2.5 text-xs leading-5 text-[#23476f]">
                        Existing applications keep the workflow snapshot they started with. Changes here apply to new applications.
                    </p>}
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
