import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

import PageContainer from "../components/ui/PageContainer";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

function Profile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // User Profile fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [cgpa, setCgpa] = useState("");
    const [branch, setBranch] = useState("");
    const [graduationYear, setGraduationYear] = useState("");
    const [skillsText, setSkillsText] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [resumeUrl, setResumeUrl] = useState("");
    const [isProfileCompleted, setIsProfileCompleted] = useState(false);

    // File upload state
    const [resumeBase64, setResumeBase64] = useState("");
    const [resumeName, setResumeName] = useState("");

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await api.get("/auth/me");
            const user = res.data;
            
            setName(user.name || "");
            setEmail(user.email || "");
            setCgpa(user.cgpa !== undefined && user.cgpa !== null ? user.cgpa : "");
            setBranch(user.branch || "");
            setGraduationYear(user.graduationYear || "");
            setSkillsText(user.skills ? user.skills.join(", ") : "");
            setContactNumber(user.contactNumber || "");
            setResumeUrl(user.resumeUrl || "");
            setIsProfileCompleted(user.isProfileCompleted || false);
        } catch (error) {
            console.error("Error loading profile", error);
            toast.error(error.response?.data?.message || "Failed to load profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== "application/pdf") {
                toast.error("Only PDF files are allowed.");
                e.target.value = null; // Clear file input
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error("File size must be under 5MB.");
                e.target.value = null;
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setResumeBase64(reader.result);
                setResumeName(file.name);
            };
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            
            // Format skills from comma-separated list to array of trimmed strings
            const skillsArray = skillsText
                .split(",")
                .map((skill) => skill.trim())
                .filter((skill) => skill.length > 0);

            const payload = {
                name,
                cgpa: cgpa === "" ? null : Number(cgpa),
                branch,
                graduationYear: graduationYear === "" ? null : Number(graduationYear),
                skills: skillsArray,
                contactNumber,
            };

            // If a new resume is loaded, include it in payload
            if (resumeBase64 && resumeName) {
                payload.resumeBase64 = resumeBase64;
                payload.resumeName = resumeName;
            }

            const res = await api.put("/auth/profile", payload);
            toast.success("Profile updated successfully!");
            
            const updatedUser = res.data.user;
            setResumeUrl(updatedUser.resumeUrl || "");
            setIsProfileCompleted(updatedUser.isProfileCompleted || false);
            setResumeBase64(""); // Clear base64 buffer after success
            setResumeName("");
        } catch (error) {
            console.error("Error saving profile", error);
            toast.error(error.response?.data?.message || "Profile update failed.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <PageContainer>
                <Card>
                    <div className="py-10 text-center text-gray-500">Loading Profile...</div>
                </Card>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Student Profile</h1>
                <p className="mt-2 text-sm text-gray-500">
                    Keep your profile details and resume up to date to apply for placement opportunities.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left Card: Summary Details & Status */}
                <div className="space-y-6 lg:col-span-1">
                    <Card className="text-center">
                        <div className="flex flex-col items-center py-4">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-600">
                                {name ? name.charAt(0).toUpperCase() : "S"}
                            </div>
                            <h2 className="mt-4 text-xl font-bold text-gray-900">{name}</h2>
                            <p className="text-sm text-gray-500">{email}</p>
                            
                            <div className="mt-6 w-full border-t border-gray-100 pt-6">
                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                    isProfileCompleted 
                                        ? "bg-green-100 text-green-800" 
                                        : "bg-yellow-100 text-yellow-800"
                                }`}>
                                    {isProfileCompleted ? "Profile Complete" : "Profile Incomplete"}
                                </span>
                                <p className="mt-2 text-xs text-gray-400">
                                    {isProfileCompleted 
                                        ? "Your profile has all required academic details." 
                                        : "Fill in CGPA, Branch, Graduation Year, and Contact info to complete."}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Resume Download Display */}
                    <Card>
                        <h3 className="text-md font-semibold text-gray-900">Resume Status</h3>
                        <div className="mt-4 flex flex-col gap-3">
                            {resumeUrl ? (
                                <>
                                    <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50/50 p-3 text-sm text-green-800">
                                        <svg className="h-5 w-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="truncate">Resume is uploaded and active.</span>
                                    </div>
                                    <a
                                        href={resumeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex w-full justify-center items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                                    >
                                        View Uploaded Resume
                                    </a>
                                </>
                            ) : (
                                <div className="flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50/50 p-3 text-sm text-yellow-800">
                                    <svg className="h-5 w-5 text-yellow-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span>No resume uploaded yet.</span>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right Card: Editor Form */}
                <div className="lg:col-span-2">
                    <Card>
                        <h3 className="mb-6 text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Edit Profile Info</h3>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Input
                                    label="Full Name"
                                    type="text"
                                    placeholder="Enter full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                                <Input
                                    label="Email Address"
                                    type="email"
                                    value={email}
                                    disabled
                                    className="bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <Input
                                    label="CGPA"
                                    type="number"
                                    step="0.01"
                                    placeholder="e.g. 8.75"
                                    value={cgpa}
                                    onChange={(e) => setCgpa(e.target.value)}
                                />
                                <Input
                                    label="Branch / Department"
                                    type="text"
                                    placeholder="e.g. Computer Science"
                                    value={branch}
                                    onChange={(e) => setBranch(e.target.value)}
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <Input
                                    label="Graduation Year"
                                    type="number"
                                    placeholder="e.g. 2026"
                                    value={graduationYear}
                                    onChange={(e) => setGraduationYear(e.target.value)}
                                />
                                <Input
                                    label="Contact Number"
                                    type="tel"
                                    placeholder="10-digit number"
                                    value={contactNumber}
                                    onChange={(e) => setContactNumber(e.target.value)}
                                />
                            </div>

                            <div>
                                <Input
                                    label="Skills (Comma Separated)"
                                    type="text"
                                    placeholder="e.g. React, Node.js, Python, MongoDB"
                                    value={skillsText}
                                    onChange={(e) => setSkillsText(e.target.value)}
                                />
                                {skillsText && (
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {skillsText.split(",").map((s) => s.trim()).filter((s) => s.length > 0).map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Resume PDF File Input */}
                            <div className="rounded-lg border border-dashed border-gray-300 p-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Resume (PDF format, Max 5MB)</label>
                                <div className="mt-1 flex items-center justify-between gap-4">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-blue-50 file:text-blue-700
                                            hover:file:bg-blue-100 transition file:cursor-pointer"
                                    />
                                    {resumeName && (
                                        <span className="text-xs text-gray-500 font-medium truncate max-w-[200px]" title={resumeName}>
                                            Selected: {resumeName}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-100">
                                <Button type="submit" disabled={saving} className="px-6">
                                    {saving ? "Saving Changes..." : "Save Profile"}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </PageContainer>
    );
}

export default Profile;
