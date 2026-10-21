import { useState } from "react";
import toast from "react-hot-toast";
import Card from "../ui/Card";
import Button from "../ui/Button";

export default function InvitationLinkNotice({ url, onDismiss }) {
    const [copying, setCopying] = useState(false);
    const copy = async () => {
        try {
            setCopying(true);
            await navigator.clipboard.writeText(url);
            toast.success("Invitation link copied.");
        } catch {
            toast.error("Copy failed. Select and copy the link manually.");
        } finally {
            setCopying(false);
        }
    };

    return (
        <Card className="mb-6 !rounded-2xl !border-slate-200 !shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-extrabold uppercase tracking-[.16em] text-slate-500">Development invitation</p>
                    <h2 className="mt-1 text-lg font-bold text-slate-900">Setup link generated</h2>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Use this link to complete the College Admin setup. It expires after 24 hours and can be used once. Keep it private.</p>
                </div>
                <Button variant="secondary" onClick={onDismiss}>Hide link</Button>
            </div>
            <p className="mt-4 break-all rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">{url}</p>
            <div className="mt-3"><Button disabled={copying} onClick={copy}>{copying ? "Copying…" : "Copy invitation link"}</Button></div>
        </Card>
    );
}
