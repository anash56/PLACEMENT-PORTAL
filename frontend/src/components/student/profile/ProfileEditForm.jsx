import Card from "../../ui/Card";
import Input from "../../ui/Input";
import Button from "../../ui/Button";

export default function ProfileEditForm({ profile, saving, resumeName, onChange, onFileChange, onSubmit }) {
    return (
        <Card className="!rounded-2xl !p-5 sm:!p-7">
            <div className="mb-6 border-b border-slate-100 pb-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#365e85]">Personal information</p>
                <h2 className="mt-2 text-xl font-extrabold tracking-[-.025em] text-slate-900 sm:text-2xl">Edit your profile</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">Accurate details help your college evaluate eligibility and share recruitment updates.</p>
            </div>
            <form onSubmit={onSubmit} className="space-y-6">
                <fieldset className="space-y-4">
                    <legend className="mb-3 text-sm font-extrabold text-slate-800">Account details</legend>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Input label="Full name" id="student-profile-name" name="name" autoComplete="name" value={profile.name} onChange={onChange} required maxLength={120} />
                        <Input label="Email address" id="student-profile-email" type="email" value={profile.email} disabled className="!bg-slate-50 !text-slate-500" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Input label="Contact number" id="student-profile-phone" name="contactNumber" type="tel" autoComplete="tel" value={profile.contactNumber} onChange={onChange} maxLength={30} placeholder="Phone number for placement updates" />
                        <Input label="Graduation year" id="student-profile-year" name="graduationYear" type="number" min="1900" max="2100" value={profile.graduationYear} onChange={onChange} placeholder="e.g. 2027" />
                    </div>
                </fieldset>

                <fieldset className="space-y-4">
                    <legend className="mb-3 text-sm font-extrabold text-slate-800">Academic details</legend>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Input label="CGPA (0–10)" id="student-profile-cgpa" name="cgpa" type="number" min="0" max="10" step="0.01" value={profile.cgpa} onChange={onChange} placeholder="e.g. 8.25" />
                        <Input label="Branch / department" id="student-profile-branch" name="branch" value={profile.branch} onChange={onChange} maxLength={120} placeholder="e.g. Information Technology" />
                    </div>
                    <Input label="Skills (comma separated)" id="student-profile-skills" name="skillsText" value={profile.skillsText} onChange={onChange} placeholder="Java, React, SQL" />
                </fieldset>

                <fieldset className="space-y-3">
                    <legend className="mb-1 text-sm font-extrabold text-slate-800">Resume</legend>
                    <p className="text-sm leading-6 text-slate-500">Upload a PDF, up to 5 MB. Your resume is used when reviewing eligible job applications.</p>
                    <label htmlFor="student-profile-resume" className="flex cursor-pointer flex-col gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-4 transition hover:border-[#9db2ca] hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                        <span className="min-w-0">
                            <span className="block text-sm font-bold text-slate-800">{resumeName || (profile.resumeUrl ? "Replace uploaded resume" : "Choose a PDF resume")}</span>
                            <span className="mt-1 block text-xs text-slate-500">{resumeName ? "Selected; save your profile to upload it." : profile.resumeUrl ? "A resume is already saved. Choose a new file to replace it." : "PDF · maximum 5 MB"}</span>
                        </span>
                        <span className="inline-flex min-h-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-[#365e85]">Browse files</span>
                        <input id="student-profile-resume" type="file" accept="application/pdf,.pdf" onChange={onFileChange} className="sr-only" />
                    </label>
                </fieldset>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs leading-5 text-slate-500">Email is managed by your account and cannot be changed here.</p>
                    <Button type="submit" disabled={saving} className="!min-w-36">
                        {saving ? "Saving profile…" : "Save profile"}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
