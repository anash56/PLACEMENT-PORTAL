import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import api from "../services/api";
import PageContainer from "../components/ui/PageContainer";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import AdminPageHeader from "../components/admin/AdminPageHeader";

export default function VerificationQueue() {
    const [students, setStudents] = useState([]);
    const [reasons, setReasons] = useState({});
    const [loading, setLoading] = useState(true);
    const [pendingDecision, setPendingDecision] = useState(null);
    const [decisionLoading, setDecisionLoading] = useState(false);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const result = await api.get("/verification/queue");
            setStudents(result.data.students || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not load verification queue.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const requestDecision = (student, action) => {
        const reason = (reasons[student._id] || "").trim();
        if (action === "reject" && !reason) {
            toast.error("Enter a rejection reason before rejecting this student.");
            return;
        }
        setPendingDecision({ student, action, reason });
    };

    const confirmDecision = async () => {
        if (!pendingDecision || decisionLoading) return;
        const { student, action, reason } = pendingDecision;
        setDecisionLoading(true);
        try {
            await api.patch(`/verification/${student._id}/${action}`, { reason });
            toast.success(action === "approve" ? "Student verified." : "Verification rejected.");
            setPendingDecision(null);
            await load();
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not update verification.");
        } finally {
            setDecisionLoading(false);
        }
    };

    const viewId = async student => {
        try {
            const result = await api.get(`/verification/${student._id}/id-card`);
            window.open(result.data.url, "_blank", "noopener,noreferrer");
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not access ID card.");
        }
    };

    return (
        <>
            <PageContainer>
                <AdminPageHeader
                    title="Student verification"
                    description="Review affiliation documents from students registered to your college."
                    eyebrow="College placement workspace"
                />

                {loading ? (
                    <Card><p className="py-5 text-center text-sm text-gray-500" role="status" aria-live="polite">Loading verification requests…</p></Card>
                ) : students.length === 0 ? (
                    <Card><div className="py-8 text-center"><h2 className="text-lg font-semibold">All caught up</h2><p className="mt-2 text-sm text-gray-500">There are no student verification requests to review.</p></div></Card>
                ) : (
                    <div className="space-y-4">
                        {students.map(student => (
                            <Card key={student._id}>
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-lg font-semibold">{student.name}</h2>
                                            <span className={`rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${student.verificationStatus === "rejected" ? "border-rose-100 bg-rose-50 text-rose-800" : "border-amber-100 bg-amber-50 text-amber-800"}`}>{student.verificationStatus || "pending"}</span>
                                        </div>
                                        <p className="mt-1 break-words text-sm text-gray-500">{student.email}</p>
                                        <p className="mt-3 text-sm leading-6 text-gray-700">{student.branch || "Branch not set"} · CGPA {student.cgpa ?? "—"} · Batch {student.graduationYear ?? "—"}</p>
                                        {student.verificationRejectionReason && <p className="mt-2 rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-800">Previous reason: {student.verificationRejectionReason}</p>}
                                    </div>
                                    <Button variant="secondary" onClick={() => viewId(student)}>View ID card</Button>
                                </div>
                                <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end">
                                    <Input aria-label={`Rejection reason for ${student.name}`} placeholder="Reason if rejecting" value={reasons[student._id] || ""} onChange={event => setReasons(previous => ({ ...previous, [student._id]: event.target.value }))} />
                                    <Button disabled={decisionLoading} onClick={() => requestDecision(student, "approve")}>Verify student</Button>
                                    <Button variant="secondary" disabled={decisionLoading} onClick={() => requestDecision(student, "reject")}>Reject</Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </PageContainer>
            <ConfirmationModal
                open={Boolean(pendingDecision)}
                title={pendingDecision?.action === "approve" ? "Verify this student?" : "Reject verification?"}
                message={pendingDecision ? pendingDecision.action === "approve"
                    ? `Confirm that ${pendingDecision.student.name}'s student ID and college affiliation have been reviewed and verified.`
                    : `Reject ${pendingDecision.student.name}'s college verification request? The student will see this reason: ${pendingDecision.reason}`
                    : "Confirm this verification decision."}
                confirmText={pendingDecision?.action === "approve" ? "Verify student" : "Reject verification"}
                confirmVariant={pendingDecision?.action === "reject" ? "danger" : "primary"}
                loading={decisionLoading}
                onCancel={() => { if (!decisionLoading) setPendingDecision(null); }}
                onConfirm={confirmDecision}
            />
        </>
    );
}
