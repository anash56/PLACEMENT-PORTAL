import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import PageContainer from "../components/ui/PageContainer";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import ProfileSummaryCard from "../components/student/profile/ProfileSummaryCard";
import ProfileEditForm from "../components/student/profile/ProfileEditForm";
import CollegeVerificationCard from "../components/student/profile/CollegeVerificationCard";
import { isAllowedProfileFile, readFileAsDataUri } from "../utils/profileFiles";

const EMPTY_PROFILE = {
    name: "",
    email: "",
    cgpa: "",
    branch: "",
    graduationYear: "",
    skillsText: "",
    contactNumber: "",
    resumeUrl: "",
    isProfileCompleted: false,
    collegeName: "Not selected",
    verificationStatus: "pending",
    verificationRejectionReason: "",
};

function mapUserToProfile(user) {
    return {
        ...EMPTY_PROFILE,
        name: user.name || "",
        email: user.email || "",
        cgpa: user.cgpa ?? "",
        branch: user.branch || "",
        graduationYear: user.graduationYear ?? "",
        skillsText: (user.skills || []).join(", "),
        contactNumber: user.contactNumber || "",
        resumeUrl: user.resumeUrl || "",
        isProfileCompleted: Boolean(user.isProfileCompleted),
        collegeName: user.collegeName || user.college?.name || "Not selected",
        verificationStatus: user.verificationStatus || "pending",
        verificationRejectionReason: user.verificationRejectionReason || "",
    };
}

export default function Profile() {
    const [profile, setProfile] = useState(EMPTY_PROFILE);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [saving, setSaving] = useState(false);
    const [resubmitting, setResubmitting] = useState(false);
    const [resumeBase64, setResumeBase64] = useState("");
    const [resumeName, setResumeName] = useState("");
    const [idCardBase64, setIdCardBase64] = useState("");
    const [idCardName, setIdCardName] = useState("");

    const loadProfile = useCallback(async () => {
        try {
            setLoading(true);
            setLoadError("");
            const { data } = await api.get("/auth/me");
            setProfile(mapUserToProfile(data));
        } catch (requestError) {
            setLoadError(
                requestError.response?.data?.message ||
                "We couldn't load your profile. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const setField = event => {
        const { name, value } = event.target;
        setProfile(previous => ({ ...previous, [name]: value }));
    };

    const pickFile = async (event, kind) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!isAllowedProfileFile(file, kind)) {
            toast.error(kind === "resume"
                ? "Choose a PDF resume up to 5 MB."
                : "Choose a JPG, PNG, or PDF ID card up to 5 MB.");
            event.target.value = "";
            return;
        }
        try {
            const dataUri = await readFileAsDataUri(file);
            if (kind === "resume") {
                setResumeBase64(dataUri);
                setResumeName(file.name);
            } else {
                setIdCardBase64(dataUri);
                setIdCardName(file.name);
            }
        } catch {
            toast.error("We couldn't read that file. Please choose it again.");
            event.target.value = "";
        }
    };

    const saveProfile = async event => {
        event.preventDefault();
        const cgpa = profile.cgpa === "" ? null : Number(profile.cgpa);
        const graduationYear = profile.graduationYear === "" ? null : Number(profile.graduationYear);
        if (cgpa !== null && (!Number.isFinite(cgpa) || cgpa < 0 || cgpa > 10)) {
            toast.error("CGPA must be between 0 and 10.");
            return;
        }
        if (graduationYear !== null && (!Number.isInteger(graduationYear) || graduationYear < 1900 || graduationYear > 2100)) {
            toast.error("Enter a valid graduation year.");
            return;
        }

        try {
            setSaving(true);
            const payload = {
                name: profile.name.trim(),
                cgpa,
                branch: profile.branch.trim(),
                graduationYear,
                skills: profile.skillsText.split(",").map(skill => skill.trim()).filter(Boolean),
                contactNumber: profile.contactNumber.trim(),
            };
            if (resumeBase64) {
                payload.resumeBase64 = resumeBase64;
                payload.resumeName = resumeName;
            }
            const { data } = await api.put("/auth/profile", payload);
            const updatedUser = data.user || {};
            setProfile(previous => ({
                ...previous,
                ...mapUserToProfile({ ...previous, ...updatedUser, email: previous.email, collegeName: previous.collegeName }),
            }));
            setResumeBase64("");
            setResumeName("");
            toast.success("Profile updated successfully.");
        } catch (requestError) {
            toast.error(requestError.response?.data?.message || "Profile update failed.");
        } finally {
            setSaving(false);
        }
    };

    const resubmitIdCard = async event => {
        event.preventDefault();
        if (!idCardBase64) {
            toast.error("Choose your college ID card first.");
            return;
        }
        try {
            setResubmitting(true);
            await api.post("/verification/resubmit", { collegeIdCardBase64: idCardBase64 });
            setProfile(previous => ({ ...previous, verificationStatus: "pending", verificationRejectionReason: "" }));
            setIdCardBase64("");
            setIdCardName("");
            toast.success("ID card submitted. Verification is pending.");
        } catch (requestError) {
            toast.error(requestError.response?.data?.message || "ID card submission failed.");
        } finally {
            setResubmitting(false);
        }
    };

    if (loading) {
        return <PageContainer><Card><p className="text-sm text-slate-600">Loading your profile…</p></Card></PageContainer>;
    }

    if (loadError) {
        return (
            <PageContainer>
                <Card className="!rounded-2xl">
                    <div className="py-8 text-center">
                        <h1 className="text-xl font-extrabold text-slate-900">Unable to load profile</h1>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{loadError}</p>
                        <Button className="mt-5" onClick={loadProfile}>Try again</Button>
                    </div>
                </Card>
            </PageContainer>
        );
    }

    return (
        <PageContainer className="!py-7 sm:!py-10">
            <div className="mx-auto max-w-6xl">
                <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-[#365e85] sm:text-xs">Your account</p>
                        <h1 className="mt-2 text-3xl font-extrabold tracking-[-.045em] text-slate-900 sm:text-4xl">Student profile</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Keep your academic details and resume up to date. Your college verification status controls placement access.</p>
                    </div>
                    <Button variant="secondary" onClick={loadProfile} disabled={loading}>Refresh profile</Button>
                </div>

                <div className="grid items-start gap-5 lg:grid-cols-[minmax(260px,.8fr)_minmax(0,1.8fr)]">
                    <div className="space-y-5">
                        <ProfileSummaryCard profile={profile} />
                        {profile.verificationStatus !== "verified" && (
                            <CollegeVerificationCard
                                profile={profile}
                                idCardName={idCardName}
                                resubmitting={resubmitting}
                                onFileChange={event => pickFile(event, "id")}
                                onSubmit={resubmitIdCard}
                            />
                        )}
                    </div>
                    <ProfileEditForm
                        profile={profile}
                        saving={saving}
                        resumeName={resumeName}
                        onChange={setField}
                        onFileChange={event => pickFile(event, "resume")}
                        onSubmit={saveProfile}
                    />
                </div>
            </div>
        </PageContainer>
    );
}
